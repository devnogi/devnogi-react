"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { UnifiedSearchResponse } from "@/types/unified-search";

const SEARCH_DEBOUNCE_MS = 200;

export function useUnifiedSearch(query: string) {
  const normalizedQuery = query.trim();
  const [debouncedQuery, setDebouncedQuery] = useState(normalizedQuery);

  useEffect(() => {
    const timeout = setTimeout(
      () => setDebouncedQuery(normalizedQuery),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timeout);
  }, [normalizedQuery]);

  const searchQuery = useQuery({
    queryKey: ["unified-search", debouncedQuery],
    enabled: debouncedQuery.length > 0,
    staleTime: 60_000,
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams({ query: debouncedQuery });
      const response = await fetch(`/api/total-search?${params.toString()}`, {
        cache: "no-store",
        signal,
      });
      const body = (await response.json()) as UnifiedSearchResponse;
      if (!response.ok || !body.success) {
        throw new Error(body.message || "통합 검색에 실패했습니다.");
      }
      return body;
    },
  });

  return {
    ...searchQuery,
    data: searchQuery.data?.data ?? [],
    partialFailures: searchQuery.data?.partialFailures ?? [],
    isDebouncing: normalizedQuery !== debouncedQuery,
  };
}
