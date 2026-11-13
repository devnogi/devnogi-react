import { cache } from "react";

import type { ItemInfoResponse } from "@/types/item-info";
import type { VolumeRankingResponse } from "@/types/ranking";
import type {
  ItemDailyStatistics,
  ItemWeeklyStatistics,
  StatisticsBase,
} from "@/types/statistics";

import { getKstDateRange, weekEnd } from "./dates";
import { decodeItemKey, type ItemIdentity } from "./identity";

interface LastTrade extends StatisticsBase {
  periodType: "DAILY" | "WEEKLY";
  periodStart: string;
  periodEnd: string;
  updatedAt: string | null;
}

export interface ItemSeoData {
  item: ItemInfoResponse;
  seoEligible: boolean;
  lastTrade: LastTrade | null;
}

export interface ItemStatistics {
  dailyStatistics: ItemDailyStatistics[];
  weeklyStatistics: ItemWeeklyStatistics[];
  dailyStatus: "available" | "empty" | "error";
  weeklyStatus: "available" | "empty" | "error";
}

interface RawDaily extends StatisticsBase {
  itemName: string;
  dateAuctionBuy: string;
}
interface RawWeekly extends StatisticsBase {
  itemName: string;
  weekStartDate: string;
}

export async function getPublicItemJson<T>(
  path: string,
  revalidate?: number,
): Promise<T> {
  const origin = process.env.GATEWAY_URL;
  if (!origin) throw new Error("GATEWAY_URL 환경 변수가 설정되지 않았습니다.");
  const response = await fetch(new URL(path, origin), {
    ...(revalidate ? { next: { revalidate } } : { cache: "no-store" as const }),
    signal: AbortSignal.timeout(5000),
    headers: { Accept: "application/json" },
  });
  if (!response.ok)
    throw Object.assign(new Error(`아이템 API 호출 실패: ${response.status}`), {
      status: response.status,
    });
  const payload: unknown = await response.json();
  if (typeof payload === "object" && payload !== null && "success" in payload) {
    if (payload.success !== true || !("data" in payload))
      throw new Error("아이템 API 응답 오류");
    return payload.data as T;
  }
  return payload as T;
}

function weightedAverage(item: StatisticsBase) {
  return item.totalQuantity > 0
    ? item.totalVolume / item.totalQuantity
    : Number(item.avgPrice);
}

export async function getItemStatistics(
  item: ItemIdentity,
): Promise<ItemStatistics> {
  const identity = {
    itemName: item.name,
    topCategory: item.topCategory,
    subCategory: item.subCategory,
  };
  const dailyParams = new URLSearchParams({
    ...identity,
    ...getKstDateRange(30),
  });
  const weeklyParams = new URLSearchParams({
    ...identity,
    ...getKstDateRange(120),
  });
  const [daily, weekly] = await Promise.allSettled([
    getPublicItemJson<RawDaily[]>(
      `/oab/statistics/daily/items?${dailyParams}`,
      300,
    ).then((rows) => {
      if (!Array.isArray(rows)) throw new Error("일간 통계 응답 오류");
      return rows
        .map((row) => ({
          ...row,
          itemName: item.name,
          itemTopCategory: item.topCategory,
          itemSubCategory: item.subCategory,
          date: row.dateAuctionBuy,
          avgPrice: weightedAverage(row),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }),
    getPublicItemJson<RawWeekly[]>(
      `/oab/statistics/weekly/items?${weeklyParams}`,
      300,
    ).then((rows) => {
      if (!Array.isArray(rows)) throw new Error("주간 통계 응답 오류");
      return rows
        .map((row) => ({
          ...row,
          itemName: item.name,
          itemTopCategory: item.topCategory,
          itemSubCategory: item.subCategory,
          weekStart: row.weekStartDate,
          weekEnd: weekEnd(row.weekStartDate),
          avgPrice: weightedAverage(row),
        }))
        .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
    }),
  ]);
  return {
    dailyStatistics: daily.status === "fulfilled" ? daily.value : [],
    weeklyStatistics: weekly.status === "fulfilled" ? weekly.value : [],
    dailyStatus:
      daily.status === "rejected"
        ? "error"
        : daily.value.length
          ? "available"
          : "empty",
    weeklyStatus:
      weekly.status === "rejected"
        ? "error"
        : weekly.value.length
          ? "available"
          : "empty",
  };
}

export const getItemSeo = cache(
  async (key: string): Promise<ItemSeoData | null> => {
    const identity = decodeItemKey(key);
    if (!identity) return null;
    try {
      const params = new URLSearchParams({ ...identity });
      const result = await getPublicItemJson<ItemSeoData>(
        `/oab/api/item-infos/seo?${params}`,
      );
      if (
        !result?.item ||
        typeof result.seoEligible !== "boolean" ||
        typeof result.item.name !== "string" ||
        typeof result.item.topCategory !== "string" ||
        typeof result.item.subCategory !== "string"
      )
        throw new Error("아이템 SEO 응답 오류");
      return result;
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 404
      )
        return null;
      throw error;
    }
  },
);

export const getPopularItems = cache(async () => {
  const items = await getPublicItemJson<VolumeRankingResponse[]>(
    "/oab/rankings/volume/today/popular?limit=7",
    300,
  );
  if (!Array.isArray(items)) throw new Error("인기 아이템 응답 오류");
  return items;
});
