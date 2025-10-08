"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { clientAxios } from "@/lib/api/clients";

interface UseInfinitePostsParams {
  boardId?: number;
  size?: number;
}

interface PostSummary {
  id: number;
  title: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

interface PageMeta {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}

interface PostsData {
  items: PostSummary[];
  meta: PageMeta;
}

interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

export function useInfinitePosts({
  boardId,
  size = 20,
}: UseInfinitePostsParams = {}) {
  return useInfiniteQuery<PostsData>({
    queryKey: ["posts", boardId],
    queryFn: async ({ pageParam = 1 }) => {
      // boardId가 있으면 게시판별 조회, 없으면 전체 조회
      const endpoint = boardId
        ? `/posts/${boardId}`
        : "/posts";

      const response = await clientAxios.get<ApiResponse<PostsData>>(endpoint, {
        params: {
          page: pageParam as number,
          size,
        },
      });

      return response.data.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta.isLast) {
        return lastPage.meta.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}
