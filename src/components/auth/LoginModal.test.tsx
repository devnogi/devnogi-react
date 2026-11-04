import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import { useAuth } from "@/contexts/AuthContext";
import { useConfig } from "@/contexts/ConfigContext";

import LoginModal from "./LoginModal";

jest.mock("@/contexts/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("@/contexts/ConfigContext", () => ({ useConfig: jest.fn() }));

it("모달도 소셜 로그인만 제공하고 성공 시 닫힌다", async () => {
  const refreshUser = jest.fn().mockResolvedValue(undefined);
  const onClose = jest.fn();
  const onLoginSuccess = jest.fn();
  jest
    .mocked(useAuth)
    .mockReturnValue({ refreshUser } as unknown as ReturnType<typeof useAuth>);
  jest.mocked(useConfig).mockReturnValue({
    config: { socialAuthBaseUrl: "https://auth.example.test" },
    isLoading: false,
  } as ReturnType<typeof useConfig>);

  render(
    <LoginModal isOpen onClose={onClose} onLoginSuccess={onLoginSuccess} />,
  );

  expect(screen.queryByLabelText("이메일")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("비밀번호")).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Google로 계속하기" }),
  ).toBeInTheDocument();

  await act(async () => {
    fireEvent(
      window,
      new MessageEvent("message", {
        origin: window.location.origin,
        data: { type: "social_login_success" },
      }),
    );
  });

  await waitFor(() => expect(refreshUser).toHaveBeenCalled());
  expect(onLoginSuccess).toHaveBeenCalled();
  expect(onClose).toHaveBeenCalled();
});
