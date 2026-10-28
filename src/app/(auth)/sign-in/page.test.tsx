import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Page from "./page";

const pushSpy = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: pushSpy }) }));
jest.mock("@/contexts/ConfigContext", () => ({
  useConfig: () => ({ config: null, isLoading: false }),
}));

const user = {
  userId: 7,
  email: "long.email+local@example.test",
  nickname: "local-user",
  profileImageUrl: null,
  role: "USER",
};
const success = {
  success: true,
  code: "COMMON_SUCCESS",
  message: "성공",
  data: user,
};
const denied = {
  success: false,
  code: "INVALID_TOKEN",
  message: "인증이 필요합니다.",
  data: null,
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

function AuthState() {
  const { user, isLoading } = useAuth();
  return (
    <output data-testid="auth-state">
      {isLoading ? "loading" : (user?.email ?? "anonymous")}
    </output>
  );
}

describe("이메일 로그인과 AuthContext 연결", () => {
  const originalFetch = global.fetch;
  let fetchMock: jest.Mock;
  let loginResponse: () => Promise<Response>;

  beforeEach(() => {
    pushSpy.mockReset();
    loginResponse = async () => json(success);
    fetchMock = jest.fn((url: string) =>
      url === "/api/auth/login"
        ? loginResponse()
        : Promise.resolve(json(denied, 401)),
    );
    global.fetch = fetchMock;
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "",
    });
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  async function showPage() {
    render(
      <AuthProvider>
        <Page />
        <AuthState />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("auth-state")).toHaveTextContent("anonymous"),
    );
  }
  async function fillAndSubmit(password = "1") {
    fireEvent.change(screen.getByLabelText("이메일"), {
      target: { value: user.email },
    });
    fireEvent.change(screen.getByLabelText("비밀번호"), {
      target: { value: password },
    });
    const button = screen.getByRole("button", { name: "로그인" });
    await waitFor(() => expect(button).toBeEnabled());
    fireEvent.click(button);
  }

  it("이메일 입력과 기존 탐색 링크를 제공한다", async () => {
    await showPage();
    expect(screen.getByLabelText("이메일")).toHaveAttribute("type", "email");
    expect(
      screen.getByRole("link", { name: /홈으로 돌아가기/ }),
    ).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "회원가입" })).toHaveAttribute(
      "href",
      "/sign-up",
    );
    expect(screen.getByRole("button", { name: "로그인" })).toBeDisabled();
  });

  it("올바르지 않은 이메일과 빈 비밀번호를 제출하지 않는다", async () => {
    await showPage();
    fireEvent.change(screen.getByLabelText("이메일"), {
      target: { value: "not-an-email" },
    });
    await screen.findByText("올바른 이메일 주소를 입력해주세요");
    expect(screen.getByRole("button", { name: "로그인" })).toBeDisabled();
    expect(
      fetchMock.mock.calls.some(([url]) => url === "/api/auth/login"),
    ).toBe(false);
  });

  it("20자보다 긴 이메일과 조합 제한 없는 비밀번호를 실제 API로 보내 사용자 상태를 갱신한다", async () => {
    await showPage();
    await fillAndSubmit();
    await waitFor(() => expect(pushSpy).toHaveBeenCalledWith("/"));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email: user.email, password: "1" }),
      }),
    );
    expect(screen.getByTestId("auth-state")).toHaveTextContent(user.email);
  });

  it("응답 전에는 이동하지 않고 연속 제출도 한 번만 요청한다", async () => {
    let complete!: (value: Response) => void;
    loginResponse = () =>
      new Promise((resolve) => {
        complete = resolve;
      });
    await showPage();
    await fillAndSubmit();
    const pending = await screen.findByRole("button", { name: "로그인 중..." });
    expect(pending).toBeDisabled();
    fireEvent.submit(pending.closest("form")!);
    expect(pushSpy).not.toHaveBeenCalled();
    await act(async () => {
      complete(json(success));
    });
    expect(
      fetchMock.mock.calls.filter(([url]) => url === "/api/auth/login"),
    ).toHaveLength(1);
    expect(pushSpy).toHaveBeenCalledTimes(1);
  });

  it("실패는 표시하고 이동하지 않으며 다시 제출할 수 있다", async () => {
    loginResponse = async () =>
      json({ success: false, message: "비밀번호가 일치하지 않습니다." }, 400);
    await showPage();
    await fillAndSubmit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "비밀번호가 일치하지 않습니다.",
    );
    expect(pushSpy).not.toHaveBeenCalled();
    expect(screen.getByTestId("auth-state")).toHaveTextContent("anonymous");
    loginResponse = async () => json(success);
    fireEvent.click(screen.getByRole("button", { name: "로그인" }));
    await waitFor(() => expect(pushSpy).toHaveBeenCalledWith("/"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("연결 오류도 읽을 수 있는 메시지를 표시한다", async () => {
    loginResponse = async () => {
      throw new TypeError("Failed to fetch");
    };
    await showPage();
    await fillAndSubmit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "인증 서버에 연결할 수 없습니다.",
    );
    expect(pushSpy).not.toHaveBeenCalled();
  });

  it.each([
    [
      `${window.location.origin}/auction?item=test#list`,
      "/auction?item=test#list",
    ],
    ["https://other.example/auction", "/"],
    [`${window.location.origin}/sign-in`, "/"],
    [`${window.location.origin}//other.example/path`, "/"],
  ])("referrer %s를 안전한 내부 경로로 처리한다", async (referrer, target) => {
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: referrer,
    });
    await showPage();
    await fillAndSubmit();
    await waitFor(() => expect(pushSpy).toHaveBeenCalledWith(target));
  });

  it("새 페이지 로드에서 401 → refresh → me 재조회로 사용자 상태를 복구한다", async () => {
    fetchMock
      .mockReset()
      .mockResolvedValueOnce(json(denied, 401))
      .mockResolvedValueOnce(json(success))
      .mockResolvedValueOnce(json(success));
    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("auth-state")).toHaveTextContent(user.email),
    );
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "/api/auth/me",
      "/api/auth/refresh",
      "/api/auth/me",
    ]);
  });
});
