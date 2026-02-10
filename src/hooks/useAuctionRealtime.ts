"use client";

import { useQuery } from "@tanstack/react-query";
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

function buildNestedQueryParams(
  obj: Record<string, unknown>,
  prefix = "",
): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined || value === "") {
      return;
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      const nestedParams = buildNestedQueryParams(
        value as Record<string, unknown>,
        fullKey,
      );
      nestedParams.forEach((v, k) => params.append(k, v));
    } else {
      params.append(fullKey, String(value));
    }
  });

  return params;
}

async function fetchAuctionRealtime(
  params: AuctionRealtimeSearchParams,
): Promise<AuctionRealtimeResponse> {
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

export function useAuctionRealtime(params: AuctionRealtimeSearchParams) {
  return useQuery({
    queryKey: ["auction-realtime", params],
    queryFn: () => fetchAuctionRealtime(params),
    enabled: true,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

