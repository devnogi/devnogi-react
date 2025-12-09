"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/types/community";

export interface ItemInfo {
  name: string;
  topCategory: string;
  subCategory: string;
}

async function fetchItemInfos(): Promise<ItemInfo[]> {
  const response = await fetch("/api/item-infos");

  if (!response.ok) {
    throw new Error(`Failed to fetch item infos: ${response.status}`);
  }

  const apiResponse: ApiResponse<ItemInfo[]> = await response.json();

  if (!apiResponse.success) {
    throw new Error(apiResponse.message || "Failed to fetch item infos");
  }

  return apiResponse.data || [];
}

export function useItemInfos() {
  return useQuery({
    queryKey: ["item-infos"],
    queryFn: fetchItemInfos,
    staleTime: 12 * 60 * 60 * 1000, // 12 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
