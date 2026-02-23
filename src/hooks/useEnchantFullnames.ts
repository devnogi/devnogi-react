"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchEnchantFullnames(affixPosition: "접두" | "접미"): Promise<string[]> {
  const response = await fetch(
    `/api/enchant-infos/fullnames?affix_position=${encodeURIComponent(affixPosition)}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch enchant fullnames: ${response.status}`);
  }

  const data = await response.json();
  return data?.data ?? [];
}

export function useEnchantFullnames() {
  const prefixQuery = useQuery({
    queryKey: ["enchant-fullnames", "접두"],
    queryFn: () => fetchEnchantFullnames("접두"),
    staleTime: 30 * 60 * 1000, // 30분
    gcTime: 60 * 60 * 1000, // 1시간
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const suffixQuery = useQuery({
    queryKey: ["enchant-fullnames", "접미"],
    queryFn: () => fetchEnchantFullnames("접미"),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    prefixList: prefixQuery.data ?? [],
    suffixList: suffixQuery.data ?? [],
    isLoading: prefixQuery.isLoading || suffixQuery.isLoading,
  };
}
