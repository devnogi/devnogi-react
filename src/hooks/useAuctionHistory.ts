"use client";

import { useQuery } from "@tanstack/react-query";
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

export interface AuctionHistorySearchParams {
  itemName?: string;
  itemTopCategory?: string;
  itemSubCategory?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
  // Dynamic filter fields - these will be added by SearchFilterCard
  [key: string]: string | number | undefined;
}

async function fetchAuctionHistory(
  params: AuctionHistorySearchParams,
): Promise<AuctionHistoryResponse> {
  const queryParams = new URLSearchParams();

  // Standard params
  if (params.itemName) queryParams.append("itemName", params.itemName);
  if (params.itemTopCategory)
    queryParams.append("itemTopCategory", params.itemTopCategory);
  if (params.itemSubCategory)
    queryParams.append("itemSubCategory", params.itemSubCategory);
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.size) queryParams.append("size", params.size.toString());
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.direction) queryParams.append("direction", params.direction);

  // Dynamic filter params - add any additional parameters
  const knownKeys = [
    "itemName",
    "itemTopCategory",
    "itemSubCategory",
    "page",
    "size",
    "sortBy",
    "direction",
  ];
  Object.entries(params).forEach(([key, value]) => {
    if (
      !knownKeys.includes(key) &&
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      queryParams.append(key, value.toString());
    }
  });

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
    enabled:
      !!params.itemName || !!params.itemTopCategory || !!params.itemSubCategory, // Only fetch when search criteria exist
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
