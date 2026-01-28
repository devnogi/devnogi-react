"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { clientAxios } from "@/lib/api/clients";
import {
  HornBugleResponse,
  HornBugleSearchParams,
} from "@/types/horn-bugle";
import { ApiResponse } from "@/types/community";

async function fetchHornBugle(
  params: HornBugleSearchParams
): Promise<HornBugleResponse> {
  const response = await clientAxios.get<ApiResponse<HornBugleResponse>>(
    "/horn-bugle",
    { params }
  );
  return response.data.data;
}

export function useInfiniteHornBugle(params: Omit<HornBugleSearchParams, "page">) {
  return useInfiniteQuery({
    queryKey: ["horn-bugle", params],
    queryFn: ({ pageParam = 1 }) =>
      fetchHornBugle({ ...params, page: pageParam, size: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.isLast) return undefined;
      return lastPage.meta.currentPage + 1;
    },
    staleTime: 60 * 1000, // 1분
  });
}
