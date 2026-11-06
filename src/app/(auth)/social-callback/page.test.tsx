import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { clientAxios } from "@/lib/api/clients";
import { getPendingSocialSignup } from "@/lib/auth/socialAuth";

import SocialCallbackPage from "./page";

const push = jest.fn();
const replace = jest.fn();
const refreshUser = jest.fn().mockResolvedValue(undefined);

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
  useRouter: () => ({ push, replace }),
}));
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ refreshUser }),
}));
jest.mock("@/lib/api/clients", () => ({ clientAxios: { post: jest.fn() } }));

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  sessionStorage.clear();
  window.history.replaceState({}, "", "/social-callback");
  Object.defineProperty(window, "opener", { configurable: true, value: null });
});

it("기존 회원은 안전한 성공 메시지만 부모 창에 전달한다", async () => {
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
    expect(document.body.textContent).not.toContain("synthetic-code");
    expect(close).toHaveBeenCalled();
  } finally {
    close.mockRestore();
  }
});

it("미회원은 확인 후에만 가입 증명을 저장하고 가입 화면으로 이동한다", async () => {
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
  expect(
    await screen.findByText("회원이 아닙니다. 회원 가입하시겠습니까?"),
  ).toBeInTheDocument();
  expect(getPendingSocialSignup()).toBeNull();
  expect(document.body.textContent).not.toContain("synthetic-proof");

  fireEvent.click(screen.getByRole("button", { name: "회원가입" }));

  expect(replace).toHaveBeenCalledWith("/sign-up");
  expect(getPendingSocialSignup()).toEqual(
    expect.objectContaining({
      provider: "google",
      email: "user@example.test",
      signupProof: "synthetic-proof",
    }),
  );
});

it("미회원 확인을 5분 넘게 열어두면 승인해도 만료된 가입 상태를 복원하지 않는다", async () => {
  const exchangeTime = Date.now();
  const now = jest.spyOn(Date, "now").mockReturnValue(exchangeTime);
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
  await screen.findByText("회원이 아닙니다. 회원 가입하시겠습니까?");
  now.mockReturnValue(exchangeTime + 5 * 60 * 1000);

  fireEvent.click(screen.getByRole("button", { name: "회원가입" }));

  expect(replace).toHaveBeenCalledWith("/sign-up");
  expect(getPendingSocialSignup()).toBeNull();
});

it("미회원이 취소하면 가입 상태 없이 로그인 화면으로 돌아간다", async () => {
  window.history.replaceState({}, "", "/social-callback?code=synthetic-code");
  jest.mocked(clientAxios.post).mockResolvedValue({
    data: {
      success: true,
      data: {
        type: "SIGNUP_REQUIRED",
        provider: "KAKAO",
        email: "user@example.test",
        signupProof: "synthetic-proof",
      },
    },
  });

  render(<SocialCallbackPage />);
  await screen.findByText("회원이 아닙니다. 회원 가입하시겠습니까?");
  fireEvent.click(screen.getByRole("button", { name: "취소" }));

  expect(getPendingSocialSignup()).toBeNull();
  expect(replace).toHaveBeenCalledWith("/sign-in");
});

it("교환 오류의 민감한 내용을 화면에 표시하지 않는다", async () => {
  window.history.replaceState({}, "", "/social-callback?code=synthetic-code");
  jest
    .mocked(clientAxios.post)
    .mockRejectedValue(new Error("private@example.test synthetic-proof"));

  render(<SocialCallbackPage />);

  expect(await screen.findByText(/다시 로그인해주세요/)).toBeInTheDocument();
  expect(document.body.textContent).not.toMatch(
    /private@example.test|synthetic-proof|synthetic-code/,
  );
});

it("이미 다른 로그인 방식으로 가입된 이메일은 충돌 원인을 안내한다", async () => {
  window.history.replaceState(
    {},
    "",
    "/social-callback?error=oauth_account_exists",
  );

  render(<SocialCallbackPage />);

  expect(
    await screen.findByText(
      "이미 다른 로그인 방식으로 가입된 이메일입니다. 기존에 사용한 로그인 방식으로 로그인해주세요.",
    ),
  ).toBeInTheDocument();
  expect(window.location.search).toBe("");
  expect(clientAxios.post).not.toHaveBeenCalled();
});

it("알 수 없는 소셜 인증 오류는 상세 코드를 노출하지 않는다", async () => {
  window.history.replaceState(
    {},
    "",
    "/social-callback?error=private_provider_detail",
  );

  render(<SocialCallbackPage />);

  expect(
    await screen.findByText("소셜 인증에 실패했습니다. 다시 시도해주세요."),
  ).toBeInTheDocument();
  expect(document.body.textContent).not.toContain("private_provider_detail");
  expect(window.location.search).toBe("");
});
