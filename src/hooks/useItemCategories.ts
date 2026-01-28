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

// 타임아웃이 있는 fetch
async function fetchWithTimeout(
  url: string,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// retry 로직을 포함한 fetch (3번 시도, 타임아웃 5초씩 증가: 5초, 10초, 15초)
async function fetchWithRetry(url: string, maxRetries: number = 3): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const timeout = (attempt + 1) * 5000; // 5초, 10초, 15초
    try {
      return await fetchWithTimeout(url, timeout);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      // 마지막 시도가 아니면 잠시 대기 후 재시도
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError || new Error("Failed after retries");
}

async function fetchItemCategories(): Promise<ItemCategory[]> {
  const response = await fetchWithRetry("/api/item-categories", 3);

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
    retry: false, // fetch 함수 내에서 직접 retry 처리
  });
}
