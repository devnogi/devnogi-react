import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { clientAxios } from "@/lib/api/clients";
import type { CommentPageResponseItem } from "@/types/community";

import CommentList from "./CommentList";

jest.mock("@/lib/api/clients", () => ({ clientAxios: { get: jest.fn() } }));
jest.mock(
  "./CommentForm",
  () =>
    function MockForm() {
      return <div data-testid="comment-form" />;
    },
);
jest.mock(
  "./CommentItem",
  () =>
    function MockItem({
      comment,
      replies,
    }: {
      comment: CommentPageResponseItem;
      replies: CommentPageResponseItem[];
    }) {
      return (
        <div>
          <span>{comment.nickname}</span>
          <span data-testid={`replies-${comment.id}`}>
            {replies.map((reply) => reply.nickname).join(",")}
          </span>
        </div>
      );
    },
);

const meta = {
  currentPage: 1,
  pageSize: 20,
  totalPages: 1,
  totalElements: 1,
  isFirst: true,
  isLast: true,
};
const comment = (id: number, username: string) => ({
  id,
  userId: id,
  username,
  parentComment: null,
  content: "댓글",
  likeCount: 0,
  isDeleted: false,
  isBlocked: false,
  isLiked: false,
});

describe("CommentList threads", () => {
  it("normalizes username, renders initial replies, and loads remaining replies per parent", async () => {
    (clientAxios.get as jest.Mock).mockImplementation((url: string) =>
      Promise.resolve({
        data: {
          success: true,
          data: url.endsWith("/threads")
            ? {
                items: [
                  {
                    comment: comment(1, "부모"),
                    replies: [comment(2, "첫 답글")],
                    replyCount: 2,
                  },
                ],
                meta,
              }
            : { items: [comment(2, "첫 답글"), comment(3, "다음 답글")], meta },
        },
      }),
    );
    render(
      <QueryClientProvider
        client={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      >
        <CommentList postId="9" />
      </QueryClientProvider>,
    );
    expect(await screen.findByText("부모")).toBeInTheDocument();
    expect(screen.getByTestId("replies-1")).toHaveTextContent("첫 답글");
    fireEvent.click(screen.getByRole("button", { name: /답글 1개 더 보기/ }));
    await waitFor(() =>
      expect(screen.getByTestId("replies-1")).toHaveTextContent(
        "첫 답글,다음 답글",
      ),
    );
    expect(clientAxios.get).toHaveBeenCalledWith(
      "/comments/9/1/replies",
      expect.anything(),
    );
  });
});
