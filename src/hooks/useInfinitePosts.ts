"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { clientAxios } from "@/lib/api/clients";

type SortType = "latest" | "popular" | "mostLiked";

interface UseInfinitePostsParams {
  boardId?: number;
  size?: number;
  keyword?: string;
  sortType?: SortType;
  userId?: number;
}

interface Author {
  id: number;
  username: string;
  nickname: string;
  profileImage?: string;
}

interface PostSummary {
  id: number;
  title: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  author: Author;
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
  keyword,
  sortType = "latest",
  userId,
}: UseInfinitePostsParams = {}) {
  return useInfiniteQuery<PostsData>({
    queryKey: ["posts", boardId, keyword, sortType, userId],
    queryFn: async ({ pageParam = 1 }) => {
      let endpoint: string;

      // userId가 있으면 사용자별 게시글 엔드포인트 사용
      if (userId) {
        endpoint = `/posts/user/${userId}`;
      }
      // 검색어가 있는 경우
      else if (keyword && keyword.trim()) {
        endpoint = boardId
          ? `/posts/${boardId}/search`
          : "/posts/search";
      }
      // 인기순/좋아요순인 경우 (boardId 필수)
      else if (sortType === "popular" && boardId) {
        endpoint = `/posts/${boardId}/popular`;
      } else if (sortType === "mostLiked" && boardId) {
        endpoint = `/posts/${boardId}/mostLiked`;
      }
      // 기본: 최신순
      else {
        endpoint = boardId ? `/posts/${boardId}` : "/posts";
      }

      const response = await clientAxios.get<ApiResponse<PostsData>>(endpoint, {
        params: {
          page: pageParam as number,
          size,
          ...(!userId && keyword && keyword.trim() ? { keyword: keyword.trim() } : {}),
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
