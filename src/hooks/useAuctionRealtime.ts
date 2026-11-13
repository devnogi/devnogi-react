"use client";

import { useQuery } from "@tanstack/react-query";

import { liveQueryOptions } from "@/lib/api/live-query";
import {
  AuctionRealtimeResponse,
  AuctionRealtimeSearchParams,
  readAuctionRealtimeResponse,
} from "@/types/auction-realtime";

export type { AuctionRealtimeItem } from "@/types/auction-realtime";

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
  signal: AbortSignal,
): Promise<AuctionRealtimeResponse> {
  const queryParams = buildNestedQueryParams(
    params as unknown as Record<string, unknown>,
  );

  const response = await fetch(
    `/api/auction-realtime/search?${queryParams.toString()}`,
    { cache: "no-store", signal },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch auction realtime: ${response.status}`);
  }

  return readAuctionRealtimeResponse(await response.json());
}

export function useAuctionRealtime(params: AuctionRealtimeSearchParams) {
  return useQuery({
    queryKey: ["auction-realtime", params],
    queryFn: ({ signal }) => fetchAuctionRealtime(params, signal),
    enabled: true,
    ...liveQueryOptions,
    gcTime: 5 * 60 * 1000,
  });
}
