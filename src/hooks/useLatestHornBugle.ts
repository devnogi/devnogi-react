"use client";

import { useQuery } from "@tanstack/react-query";

import { liveQueryOptions } from "@/lib/api/live-query";
import { fetchHornBugle } from "@/lib/horn-bugle";

export function useLatestHornBugle() {
  return useQuery({
    queryKey: ["horn-bugle", "home", 7],
    queryFn: async ({ signal }) =>
      (await fetchHornBugle({ page: 1, size: 7 }, signal)).items,
    ...liveQueryOptions,
    retry: false,
  });
}
