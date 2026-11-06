"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { clientAxios } from "@/lib/api/clients";

interface UserCommentActivity {
  id: number;
  postId: number;
  postTitle: string;
  content: string;
  likeCount: number;
  createdAt: string;
  serverName?: string | null;
  verified?: boolean;
}

interface PageMeta {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}

interface CommentsData {
  items: UserCommentActivity[];
  meta: PageMeta;
}

interface ApiResponse<T> {
  data: T;
}

export function useInfiniteUserComments(
  userId: number,
  size = 20,
  enabled = true,
) {
  return useInfiniteQuery<CommentsData>({
    queryKey: ["user-comments", userId, size],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await clientAxios.get<ApiResponse<CommentsData>>(
        `/comments/user/${userId}`,
        { params: { page: pageParam as number, size } },
      );
      return response.data.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.meta.isLast ? undefined : lastPage.meta.currentPage + 1,
    initialPageParam: 1,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
