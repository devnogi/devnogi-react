"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { clientAxios } from "@/lib/api/clients";
import type {
  ApiResponse,
  FeedTab,
  PageMeta,
  PostFeedItem,
} from "@/types/community";

export interface BackendPostSummary
  extends Omit<Partial<PostFeedItem>, "media"> {
  id: number;
  userId: number;
  username?: string;
  title?: string;
  content?: string;
  imageUrlList?: string[];
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  createdAt: string;
  updatedAt?: string;
  media?: Array<{
    id: number;
    kind?: "IMAGE" | "VIDEO";
    type?: "IMAGE" | "VIDEO";
    url: string;
    contentType: string;
    displayOrder?: number;
    order?: number;
  }>;
}

export type PostSummary = PostFeedItem & {
  title: string;
  username: string;
};

interface BackendPostsData {
  items: BackendPostSummary[];
  meta: PageMeta;
}

interface PostsData {
  items: PostSummary[];
  meta: PageMeta;
}

interface UseInfinitePostsParams {
  tab?: FeedTab;
  size?: number;
  keyword?: string;
  userId?: number;
  boardId?: number;
  sortType?: "latest" | "popular" | "mostLiked";
  enabled?: boolean;
}

export const normalizePostSummary = (post: BackendPostSummary): PostSummary => {
  const nickname =
    post.author?.nickname?.trim() ||
    post.username?.trim() ||
    `사용자 ${post.userId}`;
  const content = post.content?.trim() || post.title?.trim() || "";
  const media =
    post.media
      ?.map((item) => ({
        ...item,
        kind: item.kind ?? item.type ?? "IMAGE",
        displayOrder: item.displayOrder ?? item.order ?? 0,
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder) ??
    (post.imageUrlList ?? []).map((url, index) => ({
      id: -(index + 1),
      kind: "IMAGE" as const,
      url,
      contentType: "image/jpeg",
      displayOrder: index,
    }));

  return {
    id: post.id,
    userId: post.userId,
    username: nickname,
    title: content,
    author: {
      nickname,
      profileImageUrl: post.author?.profileImageUrl ?? null,
      serverName: post.author?.serverName ?? null,
      verified: post.author?.verified ?? false,
    },
    content,
    media,
    viewCount: post.viewCount ?? 0,
    likeCount: post.likeCount ?? 0,
    commentCount: post.commentCount ?? 0,
    liked: post.liked ?? false,
    bookmarked: post.bookmarked ?? false,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt ?? post.createdAt,
  };
};

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
}: UseInfinitePostsParams = {}) {
  const resolvedTab: FeedTab =
    tab ??
    (sortType === "popular" || sortType === "mostLiked" ? "popular" : "latest");

  return useInfiniteQuery<PostsData>({
    queryKey: ["community-feed", resolvedTab, keyword, userId, size],
    queryFn: async ({ pageParam = 1 }) => {
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
    initialPageParam: 1,
    enabled,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });
}
