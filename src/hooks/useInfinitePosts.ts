"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { clientAxios } from "@/lib/api/clients";
import {
  type BackendPostsData,
  normalizePostSummary,
  type PostsData,
} from "@/lib/community/feed";
import type { ApiResponse, FeedTab } from "@/types/community";

export type { PostSummary } from "@/lib/community/feed";
export { normalizePostSummary } from "@/lib/community/feed";

interface UseInfinitePostsParams {
  tab?: FeedTab;
  size?: number;
  keyword?: string;
  userId?: number;
  boardId?: number;
  sortType?: "latest" | "popular" | "mostLiked";
  enabled?: boolean;
  initialData?: BackendPostsData;
  startPage?: number;
  cacheScope?: string;
}

function endpointFor(tab: FeedTab, userId?: number): string {
  if (userId) return `/posts/user/${userId}`;
  if (tab === "bookmarks") return "/posts/bookmarks";
  if (tab === "mine") return "/posts/mine";
  return "/posts/feed";
}

export function useInfinitePosts({
  tab,
  size = 20,
  keyword,
  userId,
  sortType,
  enabled = true,
  initialData,
  startPage = 1,
  cacheScope = "public",
}: UseInfinitePostsParams = {}) {
  const resolvedTab: FeedTab =
    tab ??
    (sortType === "popular" || sortType === "mostLiked" ? "popular" : "latest");

  return useInfiniteQuery<PostsData>({
    queryKey: [
      "community-feed",
      resolvedTab,
      keyword,
      userId,
      size,
      startPage,
      cacheScope,
    ],
    queryFn: async ({ pageParam = startPage }) => {
      const response = await clientAxios.get<ApiResponse<BackendPostsData>>(
        endpointFor(resolvedTab, userId),
        {
          params: {
            page: pageParam as number,
            size,
            ...(keyword?.trim() ? { keyword: keyword.trim() } : {}),
            ...(resolvedTab === "latest" || resolvedTab === "popular"
              ? { tab: resolvedTab.toUpperCase() }
              : {}),
          },
        },
      );
      return {
        items: response.data.data.items.map(normalizePostSummary),
        meta: response.data.data.meta,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.meta.isLast ? undefined : lastPage.meta.currentPage + 1,
    initialPageParam: startPage,
    initialData:
      initialData && cacheScope === "public"
        ? {
            pages: [
              {
                ...initialData,
                items: initialData.items.map(normalizePostSummary),
              },
            ],
            pageParams: [startPage],
          }
        : undefined,
    placeholderData: initialData
      ? {
          pages: [
            {
              ...initialData,
              items: initialData.items.map(normalizePostSummary),
            },
          ],
          pageParams: [startPage],
        }
      : undefined,
    enabled,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });
}
