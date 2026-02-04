"use client";

import { useQuery } from "@tanstack/react-query";
import {
  VolumeRankingResponse,
  PriceRankingResponse,
  PriceChangeRankingResponse,
  VolumeChangeRankingResponse,
  AllTimeRankingResponse,
  RankingApiResponse,
} from "@/types/ranking";

// ===== 거래량 랭킹 =====

async function fetchVolumeRanking(
  type: "today" | "week",
  limit: number
): Promise<VolumeRankingResponse[]> {
  const response = await fetch(
    `/api/rankings/volume?type=${type}&limit=${limit}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch volume ranking: ${response.status}`);
  }
  const result: RankingApiResponse<VolumeRankingResponse[]> =
    await response.json();
  return result.data ?? [];
}

export function useTodayPopularRanking(limit: number = 10) {
  return useQuery({
    queryKey: ["ranking", "volume", "today", limit],
    queryFn: () => fetchVolumeRanking("today", limit),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000,
  });
}

export function useWeekPopularRanking(limit: number = 10) {
  return useQuery({
    queryKey: ["ranking", "volume", "week", limit],
    queryFn: () => fetchVolumeRanking("week", limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ===== 가격 랭킹 =====

async function fetchPriceRanking(
  type: "today-highest" | "week-highest" | "today-largest",
  limit: number
): Promise<PriceRankingResponse[]> {
  const response = await fetch(
    `/api/rankings/price?type=${type}&limit=${limit}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch price ranking: ${response.status}`);
  }
  const result: RankingApiResponse<PriceRankingResponse[]> =
    await response.json();
  return result.data ?? [];
}

export function useTodayHighestPriceRanking(limit: number = 10) {
  return useQuery({
    queryKey: ["ranking", "price", "today-highest", limit],
    queryFn: () => fetchPriceRanking("today-highest", limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useWeekHighestPriceRanking(limit: number = 10) {
  return useQuery({
    queryKey: ["ranking", "price", "week-highest", limit],
    queryFn: () => fetchPriceRanking("week-highest", limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useTodayLargestVolumeRanking(limit: number = 10) {
  return useQuery({
    queryKey: ["ranking", "price", "today-largest", limit],
    queryFn: () => fetchPriceRanking("today-largest", limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ===== 가격 변동 랭킹 =====

async function fetchPriceChangeRanking(
  type: "surge" | "drop",
  limit: number
): Promise<PriceChangeRankingResponse[]> {
  const response = await fetch(
    `/api/rankings/price-change?type=${type}&limit=${limit}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch price change ranking: ${response.status}`);
  }
  const result: RankingApiResponse<PriceChangeRankingResponse[]> =
    await response.json();
  return result.data ?? [];
}

export function usePriceSurgeRanking(limit: number = 10) {
  return useQuery({
    queryKey: ["ranking", "price-change", "surge", limit],
    queryFn: () => fetchPriceChangeRanking("surge", limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function usePriceDropRanking(limit: number = 10) {
  return useQuery({
    queryKey: ["ranking", "price-change", "drop", limit],
    queryFn: () => fetchPriceChangeRanking("drop", limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ===== 거래량 변동 랭킹 =====

async function fetchVolumeSurgeRanking(
  limit: number
): Promise<VolumeChangeRankingResponse[]> {
  const response = await fetch(
    `/api/rankings/price-change?type=volume-surge&limit=${limit}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch volume surge ranking: ${response.status}`);
  }
  const result: RankingApiResponse<VolumeChangeRankingResponse[]> =
    await response.json();
  return result.data ?? [];
}

export function useVolumeSurgeRanking(limit: number = 10) {
  return useQuery({
    queryKey: ["ranking", "price-change", "volume-surge", limit],
    queryFn: () => fetchVolumeSurgeRanking(limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ===== 역대 기록 랭킹 =====

async function fetchAllTimeRanking(
  type: "highest-price" | "month-largest",
  limit: number
): Promise<AllTimeRankingResponse[]> {
  const response = await fetch(
    `/api/rankings/all-time?type=${type}&limit=${limit}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch all-time ranking: ${response.status}`);
  }
  const result: RankingApiResponse<AllTimeRankingResponse[]> =
    await response.json();
  return result.data ?? [];
}

export function useAllTimeHighestPriceRanking(limit: number = 10) {
  return useQuery({
    queryKey: ["ranking", "all-time", "highest-price", limit],
    queryFn: () => fetchAllTimeRanking("highest-price", limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useMonthLargestVolumeRanking(limit: number = 10) {
  return useQuery({
    queryKey: ["ranking", "all-time", "month-largest", limit],
    queryFn: () => fetchAllTimeRanking("month-largest", limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
