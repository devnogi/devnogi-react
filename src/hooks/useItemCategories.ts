"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/types/community";

export interface ItemCategory {
  id: string;
  name: string;
  children?: ItemCategory[];
}

interface ItemCategoriesData {
  categories: ItemCategory[];
}

async function fetchItemCategories(): Promise<ItemCategory[]> {
  const response = await fetch("/api/item-categories");

  if (!response.ok) {
    throw new Error(`Failed to fetch item categories: ${response.status}`);
  }

  const apiResponse: ApiResponse<ItemCategoriesData> = await response.json();

  if (!apiResponse.success) {
    throw new Error(apiResponse.message || "Failed to fetch item categories");
  }

  return apiResponse.data?.categories || [];
}

export function useItemCategories() {
  return useQuery({
    queryKey: ["item-categories"],
    queryFn: fetchItemCategories,
    staleTime: 12 * 60 * 60 * 1000, // 12 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
