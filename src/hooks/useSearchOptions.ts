"use client";

import { useQuery } from "@tanstack/react-query";
import {
  SearchOptionsApiResponse,
  SearchOptionMetadata,
} from "@/types/search-filter";

async function fetchSearchOptions(): Promise<SearchOptionMetadata[]> {
  const response = await fetch("/api/search-option");

  if (!response.ok) {
    throw new Error(`Failed to fetch search options: ${response.status}`);
  }

  const apiResponse: SearchOptionsApiResponse = await response.json();

  if (!apiResponse.success) {
    throw new Error(apiResponse.message || "Failed to fetch search options");
  }

  // Sort by displayOrder
  return (apiResponse.data || []).sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
}

export function useSearchOptions() {
  return useQuery({
    queryKey: ["search-options"],
    queryFn: fetchSearchOptions,
    staleTime: 30 * 60 * 1000, // 30 minutes - metadata doesn't change often
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}
