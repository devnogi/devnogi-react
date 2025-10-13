"use client";

import { useQuery } from "@tanstack/react-query";
import { clientAxios } from "@/lib/api/clients";

export interface PostDetail {
  id: number;
  boardId: number;
  userId: number;
  title: string;
  content: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isDraft: boolean;
  isBlocked: boolean;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

export function usePostDetail(postId: number) {
  return useQuery<PostDetail>({
    queryKey: ["post", postId],
    queryFn: async () => {
      const response = await clientAxios.get<ApiResponse<PostDetail>>(
        `/posts/details/${postId}`
      );
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}
