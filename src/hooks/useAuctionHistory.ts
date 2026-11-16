"use client";

import { useQuery } from "@tanstack/react-query";

import { AuctionHistorySearchParams } from "@/types/auction-history";
import { ApiResponse } from "@/types/community";

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

interface PageMeta {
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

  const apiResponse: ApiResponse<AuctionHistoryResponse> | null =
    await response.json();

  if (apiResponse?.success !== true) {
    throw new Error(apiResponse?.message || "Failed to fetch auction history");
  }

  const data = apiResponse.data;
  if (
    !data ||
    !Array.isArray(data.items) ||
    !data.items.every(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        typeof item.auctionBuyId === "string" &&
        typeof item.itemName === "string" &&
        typeof item.itemDisplayName === "string" &&
        typeof item.itemTopCategory === "string" &&
        typeof item.itemSubCategory === "string" &&
        typeof item.dateAuctionBuy === "string" &&
        Number.isFinite(item.itemCount) &&
        Number.isFinite(item.auctionPricePerUnit) &&
        Array.isArray(item.itemOptions) &&
        item.itemOptions.every(
          (option) =>
            option !== null &&
            typeof option === "object" &&
            typeof option.optionType === "string" &&
            typeof option.optionValue === "string" &&
            (option.optionDesc == null ||
              typeof option.optionDesc === "string") &&
            (option.optionSubType == null ||
              typeof option.optionSubType === "string") &&
            (option.optionValue2 == null ||
              typeof option.optionValue2 === "string"),
        ),
    ) ||
    !data.meta ||
    !Number.isInteger(data.meta.currentPage) ||
    data.meta.currentPage < 1 ||
    !Number.isInteger(data.meta.pageSize) ||
    data.meta.pageSize < 1 ||
    !Number.isInteger(data.meta.totalPages) ||
    data.meta.totalPages < 0 ||
    !Number.isInteger(data.meta.totalElements) ||
    data.meta.totalElements < 0
  ) {
    throw new Error("Invalid auction history response");
  }
  return data;
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
