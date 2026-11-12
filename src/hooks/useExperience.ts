"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { clientAxios } from "@/lib/api/clients";
import type { ApiResponse } from "@/types/community";
import type {
  ExperienceHistoryPage,
  ExperienceSummary,
} from "@/types/experience";

export function useExperience(
  userId: number,
  options?: { refetchInterval: number },
) {
  return useQuery({
    queryKey: ["experience", userId, "summary"],
    queryFn: async () => {
      const { data } =
        await clientAxios.get<ApiResponse<ExperienceSummary>>(
          "/user/experience",
        );
      if (!data.success || !data.data)
        throw new Error("경험치를 불러오지 못했습니다.");
      return data.data;
    },
    refetchOnMount: "always",
    refetchInterval: options?.refetchInterval,
    refetchOnWindowFocus: options ? "always" : false,
    retry: false,
  });
}

export function useExperienceHistory(userId: number) {
  return useInfiniteQuery({
    queryKey: ["experience", userId, "history"],
    queryFn: async ({ pageParam }) => {
      const { data } = await clientAxios.get<
        ApiResponse<ExperienceHistoryPage>
      >("/user/experience/history", {
        params: {
          ...(pageParam === null ? {} : { cursor: pageParam }),
          size: 20,
        },
      });
      if (!data.success || !data.data)
        throw new Error("경험치 이력을 불러오지 못했습니다.");
      return data.data;
    },
    initialPageParam: null as number | null,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    refetchOnMount: "always",
    retry: false,
  });
}
