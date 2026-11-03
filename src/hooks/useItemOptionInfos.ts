"use client";

import { useQuery } from "@tanstack/react-query";

import { ApiResponse } from "@/types/community";
import { ItemOptionInfo } from "@/types/item-option-info";

async function fetchItemOptionInfos(): Promise<ItemOptionInfo[]> {
  const response = await fetch("/api/item-option-infos");

  if (!response.ok) {
    throw new Error(`Failed to fetch item option infos: ${response.status}`);
  }

  const apiResponse: ApiResponse<
    ItemOptionInfo[] | ApiResponse<ItemOptionInfo[]>
  > = await response.json();

  if (!apiResponse.success) {
    throw new Error(apiResponse.message || "Failed to fetch item option infos");
  }

  const payload = apiResponse.data;
  if (Array.isArray(payload)) return payload;
  if (!payload?.success || !Array.isArray(payload.data)) {
    throw new Error(payload?.message || "Failed to fetch item option infos");
  }
  return payload.data;
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
