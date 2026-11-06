import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";

import { AuthProvider, useAuth } from "./AuthContext";

function LogoutProbe() {
  const { user, logout } = useAuth();
  const [result, setResult] = useState("");
  return (
    <>
      <output data-testid="user">{user?.email ?? "anonymous"}</output>
      <output data-testid="result">{result}</output>
      <button
        onClick={async () => {
          try {
            await logout();
            setResult("server logout complete");
          } catch (error) {
            setResult((error as Error).message);
          }
        }}
      >
        logout
      </button>
    </>
  );
}

const observedRefreshCallbacks: Array<() => Promise<void>> = [];

function RefreshProbe() {
  const { refreshUser } = useAuth();
  observedRefreshCallbacks.push(refreshUser);
  return <button onClick={() => void refreshUser()}>refresh</button>;
}

describe("로그아웃 결과", () => {
  const originalFetch = global.fetch;
  const initialUser = {
    success: true,
    data: {
      userId: 1,
      email: "local@example.test",
      nickname: "local",
      profileImageUrl: null,
    },
  };
  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status });
  let fetchMock: jest.Mock;
  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValueOnce(json(initialUser));
    global.fetch = fetchMock;
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });
  async function begin() {
    render(
      <AuthProvider>
        <LogoutProbe />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("user")).toHaveTextContent(
        "local@example.test",
      ),
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "logout" }));
    });
  }
  it("정상 서버 응답에서 로그아웃 완료와 로컬 상태 해제를 함께 확인한다", async () => {
    fetchMock.mockResolvedValueOnce(json({ success: true, data: null }));
    await begin();
    await waitFor(() =>
      expect(screen.getByTestId("result")).toHaveTextContent(
        "server logout complete",
      ),
    );
    expect(screen.getByTestId("user")).toHaveTextContent("anonymous");
    expect(fetchMock).toHaveBeenLastCalledWith("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  });
  it.each(["http", "network"])(
    "%s 실패는 호출자에게 알리고 로컬 상태만 해제한다",
    async (failure) => {
      if (failure === "http")
        fetchMock.mockResolvedValueOnce(json({ success: false }, 503));
      else fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
      await begin();
      await waitFor(() =>
        expect(screen.getByTestId("result")).toHaveTextContent(
          "서버 로그아웃을 확인할 수 없습니다. 로컬 로그인 상태만 해제했습니다.",
        ),
      );
      expect(screen.getByTestId("user")).toHaveTextContent("anonymous");
      expect(screen.getByTestId("result")).not.toHaveTextContent(
        "server logout complete",
      );
    },
  );
});

describe("인증 콜백 안정성", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    observedRefreshCallbacks.length = 0;
  });

  it("사용자 정보가 갱신되어도 refreshUser 참조를 유지한다", async () => {
    const response = () =>
      new Response(
        JSON.stringify({
          success: true,
          data: {
            userId: 1,
            email: "stable@example.test",
            nickname: "stable",
            profileImageUrl: null,
          },
        }),
        { status: 200 },
      );
    const fetchMock = jest.fn().mockImplementation(response);
    global.fetch = fetchMock;
    render(
      <AuthProvider>
        <RefreshProbe />
      </AuthProvider>,
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const initialCallback = observedRefreshCallbacks.at(-1);

    fireEvent.click(screen.getByRole("button", { name: "refresh" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    expect(observedRefreshCallbacks.length).toBeGreaterThan(1);
    expect(
      observedRefreshCallbacks.every((item) => item === initialCallback),
    ).toBe(true);
  });
});
