import { cache } from "react";

import { AuctionHistoryItem } from "@/hooks/useAuctionHistory";
import { AuctionRealtimeItem } from "@/hooks/useAuctionRealtime";
import { getItemStatistics, getPublicItemJson } from "@/lib/items/data";
import { ItemInfoResponse, PageResponse } from "@/types/item-info";
import { ItemDailyStatistics, ItemWeeklyStatistics } from "@/types/statistics";

export { getKstDateRange } from "@/lib/items/dates";

export type AuctionDetailSource = "history" | "realtime";
export type AuctionRecord = AuctionHistoryItem | AuctionRealtimeItem;
type DetailSectionStatus = "available" | "empty" | "error";

export interface AuctionDetailResult {
  status: "available" | "not-found" | "error";
  source: AuctionDetailSource;
  record?: AuctionRecord;
  itemInfo?: ItemInfoResponse;
  dailyStatistics: ItemDailyStatistics[];
  weeklyStatistics: ItemWeeklyStatistics[];
  itemInfoStatus: DetailSectionStatus;
  dailyStatus: DetailSectionStatus;
  weeklyStatus: DetailSectionStatus;
}

export const getAuctionDetail = cache(
  async (
    source: AuctionDetailSource,
    id: string,
  ): Promise<AuctionDetailResult> => {
    const recordPath =
      source === "history"
        ? `/oab/auction-history/${encodeURIComponent(id)}`
        : `/oab/auction-realtime/${encodeURIComponent(id)}`;
    let record: AuctionRecord;
    try {
      record = await getPublicItemJson<AuctionRecord>(recordPath);
    } catch (error) {
      const status =
        typeof error === "object" && error !== null && "status" in error
          ? Number(error.status)
          : 500;
      return {
        status: status === 404 ? "not-found" : "error",
        source,
        dailyStatistics: [],
        weeklyStatistics: [],
        itemInfoStatus: "empty",
        dailyStatus: "empty",
        weeklyStatus: "empty",
      };
    }
    const identity = {
      name: record.itemName,
      topCategory: record.itemTopCategory,
      subCategory: record.itemSubCategory,
    };
    const itemInfoParams = new URLSearchParams({
      ...identity,
      page: "1",
      size: "10",
      direction: "ASC",
    });
    const [info, statistics] = await Promise.all([
      getPublicItemJson<PageResponse<ItemInfoResponse>>(
        `/oab/api/item-infos/detail?${itemInfoParams}`,
        300,
      ).then(
        (value) => ({ status: "fulfilled" as const, value }),
        () => ({ status: "rejected" as const }),
      ),
      getItemStatistics(identity),
    ]);
    const itemInfo =
      info.status === "fulfilled"
        ? info.value.content.find(
            (item) =>
              item.name === identity.name &&
              item.topCategory === identity.topCategory &&
              item.subCategory === identity.subCategory,
          )
        : undefined;
    return {
      status: "available",
      source,
      record,
      itemInfo,
      ...statistics,
      itemInfoStatus:
        info.status === "rejected" ? "error" : itemInfo ? "available" : "empty",
    };
  },
);

export function safeReturnTo(
  source: AuctionDetailSource,
  value: string | string[] | undefined,
) {
  const fallback =
    source === "history" ? "/auction-history" : "/auction-realtime";
  if (
    typeof value !== "string" ||
    (!value.startsWith(`${fallback}?`) && value !== fallback)
  )
    return fallback;
  if (value.startsWith("//") || value.includes("://")) return fallback;
  return value;
}
