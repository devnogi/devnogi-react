"use client";

import { useQuery } from "@tanstack/react-query";
import { clientAxios } from "@/lib/api/clients";
import type {
  BackendPostSummary,
  PostSummary,
} from "@/hooks/useInfinitePosts";
import { normalizePostSummary } from "@/hooks/useInfinitePosts";

interface PageMeta {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}

interface BackendPostsData {
  items: BackendPostSummary[];
  meta: PageMeta;
}

interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

interface UsePopularPostsParams {
  boardId?: number;
  limit?: number;
}

/**
 * 인기글 조회 훅
 * - boardId가 있으면: 해당 게시판의 인기글 API 호출
 * - boardId가 없으면: 전체 최신글에서 좋아요순 정렬
 */
export function usePopularPosts({ boardId, limit = 5 }: UsePopularPostsParams = {}) {
  return useQuery<PostSummary[]>({
    queryKey: ["popularPosts", boardId, limit],
    queryFn: async () => {
      if (boardId) {
        // 게시판별 인기글 API 호출
        const response = await clientAxios.get<ApiResponse<BackendPostsData>>(
          `/posts/${boardId}/popular`,
          { params: { page: 1, size: limit } }
        );
        return response.data.data.items.map(normalizePostSummary);
      } else {
        // 전체 게시글에서 좋아요순 정렬 (백엔드 전체 인기글 API 미지원)
        const response = await clientAxios.get<ApiResponse<BackendPostsData>>("/posts", {
          params: { page: 1, size: 50 },
        });
        // 클라이언트에서 좋아요순 정렬 후 상위 N개 반환
        return response.data.data.items
          .map(normalizePostSummary)
          .sort((a, b) => b.likeCount - a.likeCount)
          .slice(0, limit);
      }
    },
    staleTime: 5 * 60 * 1000, // 5분 캐시
    gcTime: 10 * 60 * 1000, // 10분
  });
}
