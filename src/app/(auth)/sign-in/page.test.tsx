import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import { useAuth } from "@/contexts/AuthContext";
import { useConfig } from "@/contexts/ConfigContext";

import SignInPage from "./page";

const push = jest.fn();
const refreshUser = jest.fn().mockResolvedValue(undefined);

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));
jest.mock("@/contexts/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("@/contexts/ConfigContext", () => ({ useConfig: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
  jest
    .mocked(useAuth)
    .mockReturnValue({ refreshUser } as unknown as ReturnType<typeof useAuth>);
  jest.mocked(useConfig).mockReturnValue({
    config: { socialAuthBaseUrl: "https://auth.example.test" },
    isLoading: false,
  } as ReturnType<typeof useConfig>);
});

it("이메일 입력 없이 소셜 로그인 제공자만 노출한다", () => {
  render(<SignInPage />);

  expect(screen.queryByLabelText("이메일")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("비밀번호")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: "회원가입" }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Google로 계속하기" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "카카오로 계속하기" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "네이버로 계속하기" }),
  ).toBeInTheDocument();
});

it("팝업의 소셜 가입 성공 메시지를 받으면 사용자와 화면을 갱신한다", async () => {
  render(<SignInPage />);

  await act(async () => {
    fireEvent(
      window,
      new MessageEvent("message", {
        origin: window.location.origin,
        data: { type: "social_signup_success" },
      }),
    );
  });

  await waitFor(() => expect(refreshUser).toHaveBeenCalled());
  expect(push).toHaveBeenCalledWith("/");
});

it("팝업에서 가입을 취소하면 저장된 복귀 주소를 삭제한다", () => {
  sessionStorage.setItem("social_login_return_url", "/community");
  render(<SignInPage />);

  fireEvent(
    window,
    new MessageEvent("message", {
      origin: window.location.origin,
      data: { type: "social_login_cancel" },
    }),
  );

  expect(sessionStorage.getItem("social_login_return_url")).toBeNull();
  expect(refreshUser).not.toHaveBeenCalled();
});
