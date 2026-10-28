import { act, render, screen, waitFor } from "@testing-library/react";

import SocialSignUpForm from "@/components/auth/SocialSignUpForm";
import { clientAxios } from "@/lib/api/clients";

import SocialCallbackPage from "./page";

const mockPush = jest.fn();
const mockRefreshUser = jest.fn().mockResolvedValue(undefined);

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
  useRouter: () => ({ push: mockPush }),
}));
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ refreshUser: mockRefreshUser }),
}));
jest.mock("@/lib/api/clients", () => ({ clientAxios: { post: jest.fn() } }));
jest.mock("@/components/auth/SocialSignUpForm", () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="social-form" />),
}));

beforeEach(() => {
  jest.clearAllMocks();
  window.history.replaceState({}, "", "/social-callback");
  sessionStorage.clear();
  Object.defineProperty(window, "opener", { configurable: true, value: null });
});

it("팝업 로그인 성공 메시지에 신원·교환 결과를 넣지 않는다", async () => {
  const postMessage = jest.fn();
  const close = jest.spyOn(window, "close").mockImplementation(() => {});
  Object.defineProperty(window, "opener", {
    configurable: true,
    value: { postMessage },
  });
  window.history.replaceState({}, "", "/social-callback?code=synthetic-code");
  jest.mocked(clientAxios.post).mockResolvedValue({
    data: { success: true, data: { type: "LOGIN_SUCCESS" } },
  });

  try {
    render(<SocialCallbackPage />);
    await waitFor(() =>
      expect(postMessage).toHaveBeenCalledWith(
        { type: "social_login_success" },
        window.location.origin,
      ),
    );
    expect(close).toHaveBeenCalled();
  } finally {
    close.mockRestore();
  }
});

it("새 OAuth 코드를 URL에서 즉시 지우고 교환한 신원 증명만 가입 폼에 전달한다", async () => {
  window.history.replaceState({}, "", "/social-callback?code=synthetic-code");
  jest.mocked(clientAxios.post).mockResolvedValue({
    data: {
      success: true,
      data: {
        type: "SIGNUP_REQUIRED",
        provider: "GOOGLE",
        email: "user@example.test",
        signupProof: "synthetic-proof",
      },
    },
  });

  render(<SocialCallbackPage />);

  expect(window.location.search).toBe("");
  expect(clientAxios.post).toHaveBeenCalledWith("/auth/oauth/exchange", {
    code: "synthetic-code",
  });
  await screen.findByTestId("social-form");
  const props = jest.mocked(SocialSignUpForm).mock.calls.at(-1)?.[0];
  expect(props?.signupProof).toBe("synthetic-proof");
  expect(props?.providerUserId).toBeUndefined();
});

it("기존 Auth의 data 쿼리도 즉시 지우고 임시 호환 로그인만 처리한다", async () => {
  const oldResponse = {
    success: true,
    code: "LOGIN_SUCCESS",
    message: "성공",
    data: {
      email: "user@example.test",
      userId: 42,
    },
  };
  window.history.replaceState(
    {},
    "",
    `/social-callback?data=${encodeURIComponent(JSON.stringify(oldResponse))}`,
  );

  render(<SocialCallbackPage />);

  expect(window.location.search).toBe("");
  expect(clientAxios.post).not.toHaveBeenCalled();
  await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
});

it("기존 Auth의 data 가입 응답도 URL을 지우고 구형 가입 폼으로 전달한다", async () => {
  const oldResponse = {
    success: true,
    code: "SIGNUP_REQUIRED",
    message: "성공",
    data: {
      provider: "KAKAO",
      providerUserId: "synthetic-provider-user",
      email: "user@example.test",
    },
  };
  window.history.replaceState(
    {},
    "",
    `/social-callback?data=${encodeURIComponent(JSON.stringify(oldResponse))}`,
  );

  render(<SocialCallbackPage />);

  expect(window.location.search).toBe("");
  expect(clientAxios.post).not.toHaveBeenCalled();
  await screen.findByTestId("social-form");
  expect(jest.mocked(SocialSignUpForm).mock.calls.at(-1)?.[0]).toEqual(
    expect.objectContaining({
      provider: "kakao",
      providerUserId: "synthetic-provider-user",
      email: "user@example.test",
      signupProof: undefined,
    }),
  );
});

it("무효 코드 실패 화면은 개인정보나 코드를 표시하지 않는다", async () => {
  window.history.replaceState({}, "", "/social-callback?code=synthetic-code");
  jest
    .mocked(clientAxios.post)
    .mockRejectedValue(new Error("private@example.test synthetic-code"));

  render(<SocialCallbackPage />);

  expect(window.location.search).toBe("");
  expect(
    await screen.findByText(/소셜 인증 정보가 만료되었거나 유효하지 않습니다/),
  ).toBeInTheDocument();
  expect(
    screen.queryByText(/private@example.test|synthetic-code/),
  ).not.toBeInTheDocument();
});

it("팝업의 이전 Auth 교환 4xx는 창을 유지하고 안전한 새로고침 안내를 표시한다", async () => {
  const postMessage = jest.fn();
  const close = jest.spyOn(window, "close").mockImplementation(() => {});
  Object.defineProperty(window, "opener", {
    configurable: true,
    value: { postMessage },
  });
  window.history.replaceState({}, "", "/social-callback?code=synthetic-code");
  jest.mocked(clientAxios.post).mockRejectedValue({
    response: {
      status: 400,
      data: { message: "private@example.test synthetic-proof" },
    },
  });
  try {
    render(<SocialCallbackPage />);
    expect(
      await screen.findByText(/페이지를 새로고침하고 다시 시도해주세요/),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(
      /private@example.test|synthetic-proof|synthetic-code/,
    );
    expect(postMessage).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
  } finally {
    close.mockRestore();
  }
});

it("팝업 소셜 가입 실패는 새로고침 안내를 표시하고 민감한 오류를 전송하지 않는다", async () => {
  const postMessage = jest.fn();
  const close = jest.spyOn(window, "close").mockImplementation(() => {});
  Object.defineProperty(window, "opener", {
    configurable: true,
    value: { postMessage },
  });
  window.history.replaceState({}, "", "/social-callback?code=synthetic-code");
  jest.mocked(clientAxios.post).mockResolvedValue({
    data: {
      success: true,
      data: {
        type: "SIGNUP_REQUIRED",
        provider: "GOOGLE",
        email: "user@example.test",
        signupProof: "synthetic-proof",
      },
    },
  });

  try {
    render(<SocialCallbackPage />);
    await screen.findByTestId("social-form");
    const onError = jest
      .mocked(SocialSignUpForm)
      .mock.calls.at(-1)?.[0].onError;
    await act(async () => {
      onError?.("private@example.test synthetic-proof");
    });
    expect(
      screen.getByText(/페이지를 새로고침하고 다시 시도해주세요/),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("social-form")).not.toBeInTheDocument();
    expect(postMessage).not.toHaveBeenCalled();
    expect(JSON.stringify(postMessage.mock.calls)).not.toMatch(
      /private@example.test|synthetic-proof/,
    );
    expect(close).not.toHaveBeenCalled();
  } finally {
    close.mockRestore();
  }
});

it("단독 소셜 가입 실패 화면은 서버 오류 원문을 표시하지 않는다", async () => {
  window.history.replaceState({}, "", "/social-callback?code=synthetic-code");
  jest.mocked(clientAxios.post).mockResolvedValue({
    data: {
      success: true,
      data: {
        type: "SIGNUP_REQUIRED",
        provider: "GOOGLE",
        email: "user@example.test",
        signupProof: "synthetic-proof",
      },
    },
  });

  render(<SocialCallbackPage />);
  await screen.findByTestId("social-form");
  const onError = jest.mocked(SocialSignUpForm).mock.calls.at(-1)?.[0].onError;
  await act(async () => {
    onError?.("private@example.test synthetic-proof");
  });
  expect(
    screen.getByText(/회원가입을 완료하지 못했습니다/),
  ).toBeInTheDocument();
  expect(
    screen.queryByText(/private@example.test|synthetic-proof/),
  ).not.toBeInTheDocument();
});
