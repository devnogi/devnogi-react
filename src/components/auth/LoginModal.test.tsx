import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useConfig } from "@/contexts/ConfigContext";

import LoginModal from "./LoginModal";

jest.mock("@/contexts/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("@/contexts/ConfigContext", () => ({ useConfig: jest.fn() }));

it("로그인 모달에 포커스를 가두고 Escape로 닫은 뒤 시작 버튼에 돌려준다", async () => {
  jest
    .mocked(useAuth)
    .mockReturnValue({ refreshUser: jest.fn() } as unknown as ReturnType<
      typeof useAuth
    >);
  jest.mocked(useConfig).mockReturnValue({
    config: { socialAuthBaseUrl: "https://auth.example.test" },
    isLoading: false,
  } as ReturnType<typeof useConfig>);
  function Host() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>모달 열기</button>
        <LoginModal isOpen={open} onClose={() => setOpen(false)} />
      </>
    );
  }
  const user = userEvent.setup();
  render(<Host />);
  const opener = screen.getByRole("button", { name: "모달 열기" });
  await user.click(opener);
  const close = screen.getByRole("button", { name: "로그인 창 닫기" });
  await waitFor(() => expect(close).toHaveFocus());
  await user.tab({ shift: true });
  expect(
    screen.getByRole("button", { name: "네이버로 계속하기" }),
  ).toHaveFocus();
  await user.tab();
  expect(close).toHaveFocus();
  await user.keyboard("{Escape}");
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  await waitFor(() => expect(opener).toHaveFocus());
});

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
