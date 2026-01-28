"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/types/community";
import { AuctionRealtimeSearchParams } from "@/types/auction-realtime";

export interface ItemOption {
  id: string;
  optionType: string;
  optionSubType: string | null;
  optionValue: string;
  optionValue2: string | null;
  optionDesc: string | null;
}

export interface AuctionRealtimeItem {
  itemName: string;
  itemDisplayName: string;
  itemCount: number;
  auctionPricePerUnit: number;
  dateAuctionExpire: string;
  dateAuctionRegister: string;
  auctionId: string;
  itemSubCategory: string;
  itemTopCategory: string;
  itemOptions: ItemOption[];
}

export interface PageMeta {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  isFirst: boolean;
  isLast: boolean;
}

export interface AuctionRealtimeResponse {
  items: AuctionRealtimeItem[];
  meta: PageMeta;
}

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

async function fetchAuctionRealtime(
  params: AuctionRealtimeSearchParams,
): Promise<AuctionRealtimeResponse> {
  // Convert entire params object to nested query parameters
  const queryParams = buildNestedQueryParams(
    params as unknown as Record<string, unknown>,
  );

  const response = await fetch(
    `/api/auction-realtime/search?${queryParams.toString()}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch auction realtime: ${response.status}`);
  }

  const apiResponse: ApiResponse<AuctionRealtimeResponse> =
    await response.json();

  if (!apiResponse.success) {
    throw new Error(apiResponse.message || "Failed to fetch auction realtime");
  }

  return apiResponse.data || { items: [], meta: {} as PageMeta };
}

export function useInfiniteAuctionRealtime(
  params: Omit<AuctionRealtimeSearchParams, "page" | "size">,
) {
  return useInfiniteQuery({
    queryKey: ["auction-realtime-infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      fetchAuctionRealtime({
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
    enabled: true, // 초기 진입 시에도 전체 실시간 경매 조회 허용
    staleTime: 1 * 60 * 1000, // 1 minute (실시간 데이터라 짧게)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export type { AuctionRealtimeItem as AuctionRealtimeItemType };
