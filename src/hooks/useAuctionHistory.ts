"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/types/community";
import { AuctionHistorySearchParams } from "@/types/auction-history";

export interface ItemOption {
  id: string;
  optionType: string;
  optionSubType: string | null;
  optionValue: string;
  optionValue2: string | null;
  optionDesc: string | null;
}

export interface AuctionHistoryItem {
  itemName: string;
  itemDisplayName: string;
  itemCount: number;
  auctionPricePerUnit: number;
  dateAuctionBuy: string;
  auctionBuyId: string;
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

export interface AuctionHistoryResponse {
  items: AuctionHistoryItem[];
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

    if (Array.isArray(value)) {
      // Handle arrays with indexed notation for Spring Boot @ModelAttribute
      (value as unknown[]).forEach((item, index) => {
        if (item === null || item === undefined) return;
        const indexedKey = `${fullKey}[${index}]`;
        if (typeof item === "object") {
          const nestedParams = buildNestedQueryParams(
            item as Record<string, unknown>,
            indexedKey,
          );
          nestedParams.forEach((v, k) => params.append(k, v));
        } else {
          params.append(indexedKey, String(item));
        }
      });
    } else if (typeof value === "object") {
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

export function useAuctionHistory(params: AuctionHistorySearchParams) {
  return useQuery({
    queryKey: ["auction-history", params],
    queryFn: () => fetchAuctionHistory(params),
    enabled: true, // 초기 진입 시에도 전체 거래 내역 조회 허용
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
