import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import { usePostDetail } from "./usePostDetail";

const mockGet = jest.fn();

jest.mock("@/lib/api/clients", () => ({
  clientAxios: { get: (...args: unknown[]) => mockGet(...args) },
}));

const publicPost = {
  id: 42,
  boardId: 1,
  userId: 7,
  username: "테스터",
  title: "공개 글",
  content: "공개 본문",
  viewCount: 1,
  likeCount: 2,
  commentCount: 3,
  isDraft: false,
  isBlocked: false,
  isLiked: false,
  createdAt: "2026-10-29T00:00:00.000Z",
  updatedAt: "2026-10-29T00:00:00.000Z",
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function QueryWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("usePostDetail", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it("refetches a public SSR snapshot after hydration for viewer-specific like state", async () => {
    mockGet.mockResolvedValue({
      data: { data: { ...publicPost, isLiked: true } },
    });

    const { result } = renderHook(
      () =>
        usePostDetail(42, {
          initialData: publicPost,
          cacheScope: `public:${publicPost.updatedAt}`,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith("/posts/details/42");
      expect(result.current.data).toMatchObject({ isLiked: true });
    });
  });
});
