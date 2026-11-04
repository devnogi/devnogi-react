import { act, render, screen, waitFor } from "@testing-library/react";

import SocialSignUpForm from "@/components/auth/SocialSignUpForm";
import { useAuth } from "@/contexts/AuthContext";
import {
  getPendingSocialSignup,
  savePendingSocialSignup,
} from "@/lib/auth/socialAuth";

import SocialSignUpPage from "./page";

const replace = jest.fn();
const refreshUser = jest.fn().mockResolvedValue(undefined);

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));
jest.mock("@/contexts/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("@/components/auth/SocialSignUpForm", () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="social-signup-form" />),
}));

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
  Object.defineProperty(window, "opener", { configurable: true, value: null });
  jest
    .mocked(useAuth)
    .mockReturnValue({ refreshUser } as unknown as ReturnType<typeof useAuth>);
});

it("직접 접근은 가입 폼을 노출하지 않고 로그인으로 돌려보낸다", async () => {
  render(<SocialSignUpPage />);

  await waitFor(() => expect(replace).toHaveBeenCalledWith("/sign-in"));
  expect(screen.queryByTestId("social-signup-form")).not.toBeInTheDocument();
});

it("OAuth 가입 상태가 있으면 URL 노출 없이 소셜 가입 폼에 전달한다", async () => {
  savePendingSocialSignup({
    provider: "naver",
    email: "user@example.test",
    signupProof: "synthetic-proof",
    createdAt: Date.now(),
  });

  render(<SocialSignUpPage />);

  await screen.findByTestId("social-signup-form");
  expect(jest.mocked(SocialSignUpForm).mock.calls.at(-1)?.[0]).toEqual(
    expect.objectContaining({
      provider: "naver",
      email: "user@example.test",
      signupProof: "synthetic-proof",
    }),
  );
  expect(window.location.search).not.toContain("synthetic-proof");
});

it("가입 성공 시 임시 증명을 삭제하고 메인으로 이동한다", async () => {
  savePendingSocialSignup({
    provider: "google",
    email: "user@example.test",
    signupProof: "synthetic-proof",
    createdAt: Date.now(),
  });
  render(<SocialSignUpPage />);
  await screen.findByTestId("social-signup-form");
  const onSuccess = jest
    .mocked(SocialSignUpForm)
    .mock.calls.at(-1)?.[0].onSuccess;

  await act(async () => onSuccess?.(7));

  expect(getPendingSocialSignup()).toBeNull();
  expect(refreshUser).toHaveBeenCalled();
  expect(replace).toHaveBeenCalledWith("/");
});
