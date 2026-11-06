import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import PostCreateModal from "./PostCreateModal";

jest.mock("./PostComposer", () => ({
  __esModule: true,
  default: ({ onPosted }: { onPosted: () => void }) => (
    <>
      <textarea aria-label="게시글 내용" />
      <button onClick={onPosted}>게시</button>
    </>
  ),
}));

function Host() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>글쓰기</button>
      <PostCreateModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}

it("본문에 초기 포커스를 두고 Tab 순환과 Escape 닫기·포커스 복귀를 제공한다", async () => {
  const user = userEvent.setup();
  render(<Host />);
  const opener = screen.getByRole("button", { name: "글쓰기" });
  await user.click(opener);
  expect(
    screen.getByRole("dialog", { name: "새 게시글 작성" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "게시글 내용" })).toHaveFocus();
  await user.tab();
  expect(screen.getByRole("button", { name: "게시" })).toHaveFocus();
  await user.tab();
  expect(screen.getByRole("button", { name: "닫기" })).toHaveFocus();
  await user.tab({ shift: true });
  expect(screen.getByRole("button", { name: "게시" })).toHaveFocus();
  await user.keyboard("{Escape}");
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  await waitFor(() => expect(opener).toHaveFocus());
});

it("게시 성공 후 기존 onPosted 흐름으로 작성창을 닫는다", async () => {
  const user = userEvent.setup();
  render(<Host />);
  await user.click(screen.getByRole("button", { name: "글쓰기" }));
  await user.click(screen.getByRole("button", { name: "게시" }));
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
});
