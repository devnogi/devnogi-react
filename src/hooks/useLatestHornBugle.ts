"use client";

import { useQuery } from "@tanstack/react-query";

import { ApiResponse } from "@/types/community";
import { HornBugleResponse } from "@/types/horn-bugle";

export function useLatestHornBugle() {
  return useQuery({
    queryKey: ["horn-bugle", "home", 7],
    queryFn: async () => {
      const response = await fetch("/api/horn-bugle?page=1&size=7");
      if (!response.ok) {
        throw new Error(`Failed to fetch horn bugle: ${response.status}`);
      }
      const result: ApiResponse<HornBugleResponse> = await response.json();
      return result.data.items;
    },
    staleTime: 60 * 1000,
    retry: false,
  });
}
