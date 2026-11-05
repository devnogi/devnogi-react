import { render, screen } from "@testing-library/react";

import { usePostDetail } from "@/hooks/usePostDetail";

import PostDetailView from "./PostDetailView";

jest.mock("@/hooks/usePostDetail", () => ({ usePostDetail: jest.fn() }));
jest.mock(
  "./PostCard",
  () =>
    function MockPostCard({ post }: { post: { bookmarked: boolean } }) {
      return <div data-testid="post-card" data-bookmarked={post.bookmarked} />;
    },
);

describe("PostDetailView", () => {
  it("normalizes the detail isBookmarked compatibility field", () => {
    (usePostDetail as jest.Mock).mockReturnValue({
      data: {
        id: 1,
        boardId: 0,
        userId: 2,
        username: "나오",
        title: "본문",
        content: "본문",
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        isDraft: false,
        isBlocked: false,
        isLiked: false,
        isBookmarked: true,
        createdAt: "2026-11-05T00:00:00.000Z",
        updatedAt: "2026-11-05T00:00:00.000Z",
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    render(<PostDetailView postId="1" />);

    expect(screen.getByTestId("post-card")).toHaveAttribute(
      "data-bookmarked",
      "true",
    );
  });
});
