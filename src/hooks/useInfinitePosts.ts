"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { clientAxios } from "@/lib/api/clients";
import { Post, PostsResponse, PostsQueryParams } from "@/types/community";

interface UseInfinitePostsParams {
  boardId?: number;
  sort?: string;
  search?: string;
  size?: number;
}

export function useInfinitePosts({
  boardId,
  sort = "latest",
  search = "",
  size = 20,
}: UseInfinitePostsParams = {}) {
  return useInfiniteQuery<PostsResponse>({
    queryKey: ["posts", boardId, sort, search],
    queryFn: async ({ pageParam = 0 }) => {
      const params: PostsQueryParams = {
        page: pageParam as number,
        size,
        sort: sort as any,
      };

      if (boardId) {
        params.boardId = boardId;
      }

      if (search) {
        params.search = search;
      }

      const response = await clientAxios.get<PostsResponse>("/posts", {
        params,
      });

      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNext) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
  });
}
