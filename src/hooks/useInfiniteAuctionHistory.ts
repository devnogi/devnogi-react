"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/types/community";
import { AuctionHistorySearchParams } from "@/types/auction-history";
import {
  AuctionHistoryResponse,
  AuctionHistoryItem,
  PageMeta,
} from "./useAuctionHistory";

/**
 * Nested object를 Spring Boot @ModelAttribute 형식의 query parameter로 변환
 * 예: { priceSearchRequest: { priceFrom: 10000 } } -> "priceSearchRequest.priceFrom=10000"
 */
function buildNestedQueryParams(
  obj: Record<string, unknown>,
  prefix = "",
): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined || value === "") {
      return; // Skip empty values
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      // Recursively handle nested objects
      const nestedParams = buildNestedQueryParams(
        value as Record<string, unknown>,
        fullKey,
      );
      nestedParams.forEach((v, k) => params.append(k, v));
    } else {
      // Primitive values
      params.append(fullKey, String(value));
    }
  });

  return params;
}

async function fetchAuctionHistory(
  params: AuctionHistorySearchParams,
): Promise<AuctionHistoryResponse> {
  // Convert entire params object to nested query parameters
  const queryParams = buildNestedQueryParams(
    params as unknown as Record<string, unknown>,
  );

  const response = await fetch(
    `/api/auction-history/search?${queryParams.toString()}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch auction history: ${response.status}`);
  }

  const apiResponse: ApiResponse<AuctionHistoryResponse> =
    await response.json();

  if (!apiResponse.success) {
    throw new Error(apiResponse.message || "Failed to fetch auction history");
  }

  return apiResponse.data || { items: [], meta: {} as PageMeta };
}

export function useInfiniteAuctionHistory(
  params: Omit<AuctionHistorySearchParams, "page" | "size">,
) {
  return useInfiniteQuery({
    queryKey: ["auction-history-infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      fetchAuctionHistory({
        ...params,
        page: pageParam,
        size: 20,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.isLast) {
        return undefined;
      }
      return lastPage.meta.currentPage + 1;
    },
    initialPageParam: 1,
    enabled:
      !!params.itemName || !!params.itemTopCategory || !!params.itemSubCategory,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export type { AuctionHistoryItem, PageMeta, AuctionHistoryResponse };
