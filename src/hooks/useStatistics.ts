"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ItemDailyStatistics,
  ItemWeeklyStatistics,
  SubcategoryDailyStatistics,
  SubcategoryWeeklyStatistics,
  TopCategoryDailyStatistics,
  TopCategoryWeeklyStatistics,
  StatisticsApiResponse,
  ItemStatisticsParams,
  SubcategoryStatisticsParams,
  TopCategoryStatisticsParams,
} from "@/types/statistics";

// ===== 아이템 일간 통계 =====

async function fetchItemDailyStatistics(
  params: ItemStatisticsParams,
): Promise<ItemDailyStatistics[]> {
  const query = new URLSearchParams({
    itemName: params.itemName,
    subCategory: params.subCategory,
    topCategory: params.topCategory,
  });
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);

  const response = await fetch(
    `/api/statistics/daily/items?${query.toString()}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }
  const result: StatisticsApiResponse<ItemDailyStatistics[]> =
    await response.json();
  return result.data ?? [];
}

export function useItemDailyStatistics(params: ItemStatisticsParams) {
  return useQuery({
    queryKey: ["statistics", "daily", "items", params],
    queryFn: () => fetchItemDailyStatistics(params),
    enabled: !!params.itemName && !!params.subCategory && !!params.topCategory,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ===== 아이템 주간 통계 =====

async function fetchItemWeeklyStatistics(
  params: ItemStatisticsParams,
): Promise<ItemWeeklyStatistics[]> {
  const query = new URLSearchParams({
    itemName: params.itemName,
    subCategory: params.subCategory,
    topCategory: params.topCategory,
  });
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);

  const response = await fetch(
    `/api/statistics/weekly/items?${query.toString()}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }
  const result: StatisticsApiResponse<ItemWeeklyStatistics[]> =
    await response.json();
  return result.data ?? [];
}

export function useItemWeeklyStatistics(params: ItemStatisticsParams) {
  return useQuery({
    queryKey: ["statistics", "weekly", "items", params],
    queryFn: () => fetchItemWeeklyStatistics(params),
    enabled: !!params.itemName && !!params.subCategory && !!params.topCategory,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ===== 서브카테고리 일간 통계 =====

async function fetchSubcategoryDailyStatistics(
  params: SubcategoryStatisticsParams,
): Promise<SubcategoryDailyStatistics[]> {
  const query = new URLSearchParams({
    topCategory: params.topCategory,
    subCategory: params.subCategory,
  });
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);

  const response = await fetch(
    `/api/statistics/daily/subcategories?${query.toString()}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }
  const result: StatisticsApiResponse<SubcategoryDailyStatistics[]> =
    await response.json();
  return result.data ?? [];
}

export function useSubcategoryDailyStatistics(
  params: SubcategoryStatisticsParams,
) {
  return useQuery({
    queryKey: ["statistics", "daily", "subcategories", params],
    queryFn: () => fetchSubcategoryDailyStatistics(params),
    enabled: !!params.topCategory && !!params.subCategory,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ===== 서브카테고리 주간 통계 =====

async function fetchSubcategoryWeeklyStatistics(
  params: SubcategoryStatisticsParams,
): Promise<SubcategoryWeeklyStatistics[]> {
  const query = new URLSearchParams({
    topCategory: params.topCategory,
    subCategory: params.subCategory,
  });
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);

  const response = await fetch(
    `/api/statistics/weekly/subcategories?${query.toString()}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }
  const result: StatisticsApiResponse<SubcategoryWeeklyStatistics[]> =
    await response.json();
  return result.data ?? [];
}

export function useSubcategoryWeeklyStatistics(
  params: SubcategoryStatisticsParams,
) {
  return useQuery({
    queryKey: ["statistics", "weekly", "subcategories", params],
    queryFn: () => fetchSubcategoryWeeklyStatistics(params),
    enabled: !!params.topCategory && !!params.subCategory,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ===== 탑카테고리 일간 통계 =====

async function fetchTopCategoryDailyStatistics(
  params: TopCategoryStatisticsParams,
): Promise<TopCategoryDailyStatistics[]> {
  const query = new URLSearchParams({
    topCategory: params.topCategory,
  });
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);

  const response = await fetch(
    `/api/statistics/daily/top-categories?${query.toString()}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }
  const result: StatisticsApiResponse<TopCategoryDailyStatistics[]> =
    await response.json();
  return result.data ?? [];
}

export function useTopCategoryDailyStatistics(
  params: TopCategoryStatisticsParams,
) {
  return useQuery({
    queryKey: ["statistics", "daily", "top-categories", params],
    queryFn: () => fetchTopCategoryDailyStatistics(params),
    enabled: !!params.topCategory,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ===== 탑카테고리 주간 통계 =====

async function fetchTopCategoryWeeklyStatistics(
  params: TopCategoryStatisticsParams,
): Promise<TopCategoryWeeklyStatistics[]> {
  const query = new URLSearchParams({
    topCategory: params.topCategory,
  });
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);

  const response = await fetch(
    `/api/statistics/weekly/top-categories?${query.toString()}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }
  const result: StatisticsApiResponse<TopCategoryWeeklyStatistics[]> =
    await response.json();
  return result.data ?? [];
}

export function useTopCategoryWeeklyStatistics(
  params: TopCategoryStatisticsParams,
) {
  return useQuery({
    queryKey: ["statistics", "weekly", "top-categories", params],
    queryFn: () => fetchTopCategoryWeeklyStatistics(params),
    enabled: !!params.topCategory,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
