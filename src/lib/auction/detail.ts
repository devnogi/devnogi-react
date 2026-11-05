import { cache } from "react";

import { AuctionHistoryItem } from "@/hooks/useAuctionHistory";
import { AuctionRealtimeItem } from "@/hooks/useAuctionRealtime";
import { ItemInfoResponse, PageResponse } from "@/types/item-info";
import { ItemDailyStatistics, ItemWeeklyStatistics } from "@/types/statistics";

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

interface ApiResponse<T> {
  success: boolean;
  data: T;
}
interface RawDaily {
  itemName: string;
  dateAuctionBuy: string;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  totalVolume: number;
  totalQuantity: number;
}
interface RawWeekly {
  itemName: string;
  weekStartDate: string;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  totalVolume: number;
  totalQuantity: number;
}

function gatewayUrl() {
  const value = process.env.GATEWAY_URL;
  if (!value) throw new Error("GATEWAY_URL 환경 변수가 설정되지 않았습니다.");
  return value.replace(/\/$/, "");
}

function unwrap<T>(value: T | ApiResponse<T>): T {
  return typeof value === "object" && value !== null && "success" in value
    ? (value as ApiResponse<T>).data
    : (value as T);
}

async function getJson<T>(path: string, revalidate?: number): Promise<T> {
  const response = await fetch(
    `${gatewayUrl()}${path}`,
    revalidate
      ? { next: { revalidate }, signal: AbortSignal.timeout(5000) }
      : { cache: "no-store", signal: AbortSignal.timeout(5000) },
  );
  if (!response.ok)
    throw Object.assign(new Error(`API 호출 실패: ${response.status}`), {
      status: response.status,
    });
  return unwrap<T>((await response.json()) as T | ApiResponse<T>);
}

function dateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function seoulDate(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return `${value.year}-${value.month}-${value.day}`;
}

export function getKstDateRange(days: number, now: Date = new Date()) {
  const endDate = seoulDate(now);
  const [year, month, day] = endDate.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, day));
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return { startDate: dateString(start), endDate };
}

function query(values: Record<string, string | number>) {
  return new URLSearchParams(
    Object.entries(values).map(([key, value]) => [key, String(value)]),
  ).toString();
}

function weightedAverage(item: {
  avgPrice: number;
  totalVolume: number;
  totalQuantity: number;
}) {
  return item.totalQuantity > 0
    ? item.totalVolume / item.totalQuantity
    : Number(item.avgPrice);
}

function weekEnd(start: string) {
  const value = new Date(`${start}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + 6);
  return dateString(value);
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
      record = await getJson<AuctionRecord>(recordPath);
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

    const itemName = record.itemName;
    const topCategory = record.itemTopCategory;
    const subCategory = record.itemSubCategory;
    const dailyRange = getKstDateRange(30);
    const weeklyRange = getKstDateRange(120);
    const identity = { itemName, topCategory, subCategory };
    const itemInfoParams = query({
      name: itemName,
      topCategory,
      subCategory,
      page: 1,
      size: 10,
      direction: "ASC",
    });
    const dailyParams = query({ ...identity, ...dailyRange });
    const weeklyParams = query({ ...identity, ...weeklyRange });

    const [itemInfoResult, dailyResult, weeklyResult] =
      await Promise.allSettled([
        getJson<PageResponse<ItemInfoResponse>>(
          `/oab/api/item-infos/detail?${itemInfoParams}`,
          300,
        ),
        getJson<RawDaily[]>(`/oab/statistics/daily/items?${dailyParams}`, 300),
        getJson<RawWeekly[]>(
          `/oab/statistics/weekly/items?${weeklyParams}`,
          300,
        ),
      ]);

    const dailyStatistics =
      dailyResult.status === "fulfilled"
        ? dailyResult.value.map((item) => ({
            itemName: item.itemName,
            itemTopCategory: topCategory,
            itemSubCategory: subCategory,
            date: item.dateAuctionBuy,
            minPrice: item.minPrice,
            maxPrice: item.maxPrice,
            avgPrice: weightedAverage(item),
            totalVolume: item.totalVolume,
            totalQuantity: item.totalQuantity,
          }))
        : [];
    const weeklyStatistics =
      weeklyResult.status === "fulfilled"
        ? weeklyResult.value.map((item) => ({
            itemName: item.itemName,
            itemTopCategory: topCategory,
            itemSubCategory: subCategory,
            weekStart: item.weekStartDate,
            weekEnd: weekEnd(item.weekStartDate),
            minPrice: item.minPrice,
            maxPrice: item.maxPrice,
            avgPrice: weightedAverage(item),
            totalVolume: item.totalVolume,
            totalQuantity: item.totalQuantity,
          }))
        : [];

    const itemInfo =
      itemInfoResult.status === "fulfilled"
        ? itemInfoResult.value.content[0]
        : undefined;

    return {
      status: "available",
      source,
      record,
      itemInfo,
      dailyStatistics,
      weeklyStatistics,
      itemInfoStatus:
        itemInfoResult.status === "rejected"
          ? "error"
          : itemInfo
            ? "available"
            : "empty",
      dailyStatus:
        dailyResult.status === "rejected"
          ? "error"
          : dailyStatistics.length > 0
            ? "available"
            : "empty",
      weeklyStatus:
        weeklyResult.status === "rejected"
          ? "error"
          : weeklyStatistics.length > 0
            ? "available"
            : "empty",
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
