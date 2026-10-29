import { render, screen } from "@testing-library/react";

import type { PostDetail } from "@/lib/community/public-post";

import PostPage, { generateMetadata } from "./page";

const getPublicPost = jest.fn();
const mockNotFound = jest.fn();

jest.mock("@/lib/community/public-post", () => ({
  getPublicPost: (...args: unknown[]) => getPublicPost(...args),
}));
jest.mock("next/navigation", () => ({
  notFound: () => mockNotFound(),
}));

jest.mock("@/components/page/community/CommentList", () => {
  function CommentListMock() {
    return <div />;
  }

  return CommentListMock;
});
jest.mock("@/components/page/community/PopularPostsHighlight", () => {
  function PopularPostsHighlightMock() {
    return <div />;
  }

  return PopularPostsHighlightMock;
});
jest.mock("@/components/page/community/RelatedPostsSection", () => {
  function RelatedPostsSectionMock({
    boardId,
    cacheScope,
  }: {
    boardId?: number;
    cacheScope?: string;
  }) {
    return (
      <div
        data-testid="related-posts"
        data-board-id={boardId}
        data-cache-scope={cacheScope}
      />
    );
  }

  return RelatedPostsSectionMock;
});
jest.mock("@/components/page/community/PostDetailView", () => {
  function PostDetailViewMock({
    initialPost,
    cacheScope,
  }: {
    initialPost?: PostDetail;
    cacheScope?: string;
  }) {
    return (
      <article data-cache-scope={cacheScope}>
        <h1>{initialPost?.title ?? "클라이언트 로딩"}</h1>
        <p>{initialPost?.content}</p>
      </article>
    );
  }

  return PostDetailViewMock;
});

const publicPost: PostDetail = {
  id: 42,
  boardId: 1,
  userId: 10,
  username: "메모노기 사용자",
  title: "마비노기 경매장 이용 팁",
  content: "공개된 게시글의 본문입니다.",
  viewCount: 1,
  likeCount: 2,
  commentCount: 3,
  isDraft: false,
  isBlocked: false,
  isLiked: false,
  createdAt: "2026-10-29T00:00:00.000Z",
  updatedAt: "2026-10-29T00:00:00.000Z",
};

describe("community post SEO", () => {
  beforeEach(() => {
    getPublicPost.mockResolvedValue({ status: "available", post: publicPost });
    mockNotFound.mockReset();
  });

  it("provides public post metadata with a canonical URL", async () => {
    await expect(
      generateMetadata({ params: Promise.resolve({ id: "42" }) }),
    ).resolves.toMatchObject({
      title: "마비노기 경매장 이용 팁",
      alternates: { canonical: "/community/42" },
      twitter: {
        title: "마비노기 경매장 이용 팁",
        description: "공개된 게시글의 본문입니다.",
      },
    });
  });

  it("renders public content and Article data before client hydration", async () => {
    render(await PostPage({ params: Promise.resolve({ id: "42" }) }));

    expect(
      screen.getByRole("heading", { name: "마비노기 경매장 이용 팁" }),
    ).toBeInTheDocument();
    expect(screen.getByText("공개된 게시글의 본문입니다.")).toBeInTheDocument();
    expect(screen.getByRole("article")).toHaveAttribute(
      "data-cache-scope",
      "public:2026-10-29T00:00:00.000Z",
    );
    expect(screen.getByTestId("related-posts")).toHaveAttribute(
      "data-board-id",
      "1",
    );
    expect(screen.getByTestId("related-posts")).toHaveAttribute(
      "data-cache-scope",
      "public:2026-10-29T00:00:00.000Z",
    );
    expect(
      document.querySelector('script[type="application/ld+json"]'),
    ).toHaveTextContent('"@type":"Article"');
  });

  it("marks non-public posts as noindex", async () => {
    getPublicPost.mockResolvedValue({ status: "not-public" });

    await expect(
      generateMetadata({ params: Promise.resolve({ id: "42" }) }),
    ).resolves.toMatchObject({
      robots: { index: false, follow: false },
    });
  });

  it("does not reuse a public content cache scope for a restricted response", async () => {
    getPublicPost.mockResolvedValue({ status: "not-public" });

    render(await PostPage({ params: Promise.resolve({ id: "42" }) }));

    expect(screen.getByRole("article")).toHaveAttribute(
      "data-cache-scope",
      "restricted",
    );
    expect(
      screen.queryByText("공개된 게시글의 본문입니다."),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("related-posts")).not.toHaveAttribute(
      "data-board-id",
    );
    expect(screen.getByTestId("related-posts")).toHaveAttribute(
      "data-cache-scope",
      "restricted",
    );
  });

  it("delegates a deleted post to the not-found boundary", async () => {
    getPublicPost.mockResolvedValue({ status: "not-found" });
    mockNotFound.mockImplementation(() => {
      throw new Error("not-found");
    });

    await expect(
      PostPage({ params: Promise.resolve({ id: "42" }) }),
    ).rejects.toThrow("not-found");
  });
});
