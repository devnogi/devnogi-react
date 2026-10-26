import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import SignUpPage from "./page";
import { useNicknameCandidate } from "@/hooks/useNicknameCandidate";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("@/hooks/useNicknameCandidate", () => ({ useNicknameCandidate: jest.fn() }));

const candidate = {
  nickname: "행복한 나무 A1B2C",
  nicknameTicket: "synthetic-candidate-ticket",
  expiresAt: "2099-01-01T00:00:00Z",
};

describe("일반 회원가입의 랜덤 닉네임", () => {
  const originalFetch = global.fetch;
  const originalAlert = window.alert;
  const fetchMock = jest.fn();

  async function fillRequiredFields() {
    const email = screen.getByPlaceholderText("example@email.com");
    fireEvent.change(email, { target: { value: "user@example.test" } });
    fireEvent.blur(email);
    await waitFor(() => expect(screen.getByText("사용 가능한 이메일입니다")).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText("영문, 숫자, 특수문자 포함 8-30자"),
      { target: { value: "Password1!" } });
    fireEvent.change(screen.getByPlaceholderText("비밀번호를 다시 입력하세요"),
      { target: { value: "Password1!" } });
    const [terms, privacy] = screen.getAllByRole("checkbox");
    fireEvent.click(terms);
    fireEvent.click(privacy);
    const submit = screen.getByRole("button", { name: "회원가입" });
    await waitFor(() => expect(submit).toBeEnabled());
    return submit;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useNicknameCandidate).mockReturnValue({
      candidate, status: "ready", error: null, refresh: jest.fn(),
    });
    global.fetch = fetchMock.mockImplementation(async (input: string) => {
      if (input.startsWith("/api/auth/check-email")) {
        return { ok: true, json: async () => ({ success: true, data: true }) };
      }
      if (input === "/api/auth/signup") {
        return { ok: true, status: 200, json: async () => ({ success: true }) };
      }
      throw new Error(`Unexpected request: ${input}`);
    });
    window.alert = jest.fn();
  });

  afterEach(() => { global.fetch = originalFetch; window.alert = originalAlert; });

  it("읽기 전용 후보를 표시하고 가입 요청에 해당 티켓을 포함한다", async () => {
    render(<SignUpPage />);
    const nickname = screen.getByRole("textbox", { name: /닉네임/ });
    expect(nickname).toHaveValue(candidate.nickname);
    expect(nickname).toHaveAttribute("readonly");

    const submit = await fillRequiredFields();
    await act(async () => { fireEvent.click(submit); });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/auth/signup", expect.any(Object)));
    const [, request] = fetchMock.mock.calls.find(([url]) => url === "/api/auth/signup");
    expect(request.body).toBeInstanceOf(FormData);
    expect(request.body.get("nickname")).toBe(candidate.nickname);
    expect(request.body.get("nicknameTicket")).toBe(candidate.nicknameTicket);
    await waitFor(() => expect(push).toHaveBeenCalledWith("/sign-in"));
  });

  it("후보 발급 실패 시 가입 버튼이 비활성화된다", async () => {
    jest.mocked(useNicknameCandidate).mockReturnValue({
      candidate: null, status: "error", error: "다시 시도해주세요", refresh: jest.fn(),
    });
    render(<SignUpPage />);
    expect(screen.getByRole("button", { name: "회원가입" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("다시 시도해주세요");
    await act(async () => { await Promise.resolve(); });
  });

  it("구형 화면에서 온 4xx 가입 오류에는 서버 메시지와 새로고침 안내를 보여준다", async () => {
    fetchMock.mockImplementation(async (input: string) => input.startsWith("/api/auth/check-email")
      ? { ok: true, json: async () => ({ success: true, data: true }) }
      : { ok: false, status: 400, json: async () => ({
        code: "INVALID_NICKNAME_TICKET", message: "새 가입 화면이 필요합니다.",
      }) });
    render(<SignUpPage />);
    const submit = await fillRequiredFields();
    await act(async () => { fireEvent.click(submit); });
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining("새 가입 화면이 필요합니다.")));
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("페이지를 새로고침"));
    expect(screen.getByRole("button", { name: "회원가입" })).toBeDisabled();
  });
});
