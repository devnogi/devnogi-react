import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { NicknamePolicyHelp } from "./NicknamePolicyHelp";

it("도움말 버튼을 키보드로 열어 정책을 읽고 닫는다", async () => {
  const user = userEvent.setup();
  render(<NicknamePolicyHelp legacy />);
  const button = screen.getByRole("button", { name: "닉네임 정책 도움말" });
  expect(button).toHaveAttribute("aria-expanded", "false");
  button.focus();
  await user.keyboard("{Enter}");
  expect(button).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("note")).toHaveTextContent(
    "기존 닉네임은 변경 전까지 유지됩니다",
  );
  await user.keyboard("{Enter}");
  expect(screen.queryByRole("note")).not.toBeInTheDocument();
});
