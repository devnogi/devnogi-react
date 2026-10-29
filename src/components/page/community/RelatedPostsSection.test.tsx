import { render } from "@testing-library/react";

import RelatedPostsSection from "./RelatedPostsSection";

const mockUsePostDetail = jest.fn();
const mockUseInfinitePosts = jest.fn();

jest.mock("@/hooks/usePostDetail", () => ({
  usePostDetail: (...args: unknown[]) => mockUsePostDetail(...args),
}));
jest.mock("@/hooks/useInfinitePosts", () => ({
  useInfinitePosts: (...args: unknown[]) => mockUseInfinitePosts(...args),
}));
jest.mock("./PostCard", () => {
  function PostCardMock() {
    return <article />;
  }

  return PostCardMock;
});

const emptyInfiniteResult = {
  data: { pages: [{ items: [] }] },
  fetchNextPage: jest.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
  isLoading: false,
  isError: false,
  refetch: jest.fn(),
};

describe("RelatedPostsSection", () => {
  beforeEach(() => {
    mockUsePostDetail.mockReset();
    mockUseInfinitePosts.mockReset();
    mockUseInfinitePosts.mockReturnValue(emptyInfiniteResult);
  });

  it("uses the server-resolved board ID without a second post-detail request", () => {
    mockUsePostDetail.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    render(
      <RelatedPostsSection
        postId="42"
        boardId={1}
        cacheScope="public:2026-10-29T00:00:00.000Z"
      />,
    );

    expect(mockUsePostDetail).toHaveBeenCalledWith(42, {
      cacheScope: "public:2026-10-29T00:00:00.000Z",
      enabled: false,
    });
    expect(mockUseInfinitePosts).toHaveBeenCalledWith(
      expect.objectContaining({ boardId: 1, enabled: true }),
    );
  });

  it("uses the same restricted query scope when no public board ID is available", () => {
    mockUsePostDetail.mockReturnValue({
      data: { boardId: 1 },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    render(<RelatedPostsSection postId="42" cacheScope="restricted" />);

    expect(mockUsePostDetail).toHaveBeenCalledWith(42, {
      cacheScope: "restricted",
      enabled: true,
    });
  });
});
