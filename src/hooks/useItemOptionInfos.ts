"use client";

import { useQuery } from "@tanstack/react-query";
import { ItemOptionInfo } from "@/types/item-option-info";
import { ApiResponse } from "@/types/community";

async function fetchItemOptionInfos(): Promise<ItemOptionInfo[]> {
  const response = await fetch("/api/item-option-infos");

  if (!response.ok) {
    throw new Error(`Failed to fetch item option infos: ${response.status}`);
  }

  const apiResponse: ApiResponse<ItemOptionInfo[]> = await response.json();

  if (!apiResponse.success) {
    throw new Error(apiResponse.message || "Failed to fetch item option infos");
  }

  return apiResponse.data || [];
}

export function useItemOptionInfos() {
  return useQuery({
    queryKey: ["item-option-infos"],
    queryFn: fetchItemOptionInfos,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 30 * 60 * 1000, // 30분
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
