import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { outfitRequest } from "@/lib/outfits/api";

import OutfitComments from "./OutfitComments";
jest.mock("@/lib/outfits/api", () => ({
  outfitRequest: jest.fn(),
  outfitJson: (method: string, body: unknown) => ({
    method,
    body: JSON.stringify(body),
  }),
}));
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { userId: 7 } }),
}));
jest.mock("./OutfitAuth", () => ({ useOutfitAuth: () => () => true }));
jest.mock("sonner", () => ({ toast: { error: jest.fn() } }));
beforeEach(() => {
  jest.mocked(outfitRequest).mockReset();
  jest.mocked(outfitRequest).mockImplementation(async (path = "", init) => {
    if (init?.method) return {};
    return {
      content: path.includes("parentId")
        ? []
        : [
            {
              id: 2,
              outfitId: 1,
              userId: 3,
              author: { nickname: "다른 사용자" },
              content: "좋은 의장이에요",
              parentId: null,
              deleted: false,
              replyCount: 0,
              createdAt: "2026-11-07T00:00:00Z",
            },
          ],
      hasNext: false,
      nextCursor: null,
    };
  });
});
it("hides editing controls for another user's comment and submits a one-level reply", async () => {
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <OutfitComments outfitId={1} />
    </QueryClientProvider>,
  );
  await screen.findByText("좋은 의장이에요");
  expect(
    screen.queryByRole("button", { name: "수정" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "삭제" }),
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "답글" }));
  fireEvent.change(screen.getByRole("textbox", { name: "답글 내용" }), {
    target: { value: "감사해요" },
  });
  fireEvent.click(screen.getAllByRole("button", { name: "댓글 등록" })[1]);
  await waitFor(() =>
    expect(outfitRequest).toHaveBeenCalledWith(
      "/1/comments",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ content: "감사해요", parentId: 2 }),
      }),
    ),
  );
});
