"use client";

import { useQuery } from "@tanstack/react-query";

import { clientAxios } from "@/lib/api/clients";
import { type PostDetail } from "@/lib/community/public-post";

export type { PostDetail } from "@/lib/community/public-post";

interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

interface UsePostDetailOptions {
  initialData?: PostDetail;
  cacheScope?: string;
}

export function usePostDetail(
  postId: number,
  { initialData, cacheScope = "viewer" }: UsePostDetailOptions = {},
) {
  return useQuery<PostDetail>({
    queryKey: ["post", postId, cacheScope],
    queryFn: async () => {
      const response = await clientAxios.get<ApiResponse<PostDetail>>(
        `/posts/details/${postId}`,
      );
      return response.data.data;
    },
    initialData,
    initialDataUpdatedAt: initialData ? 0 : undefined,
    refetchOnMount: initialData ? "always" : undefined,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}
