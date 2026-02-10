"use client";

import { Suspense, useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StatisticsTabs, {
  StatisticsTabType,
} from "@/components/page/statistics/StatisticsTabs";
import PeriodToggle, {
  PeriodType,
} from "@/components/page/statistics/PeriodToggle";
import DateRangeSelector from "@/components/page/statistics/DateRangeSelector";
import StatisticsSearchForm from "@/components/page/statistics/StatisticsSearchForm";
import PriceChart from "@/components/page/statistics/PriceChart";
import VolumeChart from "@/components/page/statistics/VolumeChart";
import StatisticsTable from "@/components/page/statistics/StatisticsTable";
import StatisticsSummaryCards from "@/components/page/statistics/StatisticsSummaryCards";
import StatisticsSkeleton from "@/components/page/statistics/StatisticsSkeleton";
import {
  useItemDailyStatistics,
  useItemWeeklyStatistics,
  useSubcategoryDailyStatistics,
  useSubcategoryWeeklyStatistics,
  useTopCategoryDailyStatistics,
  useTopCategoryWeeklyStatistics,
} from "@/hooks/useStatistics";
import {
  ItemStatisticsParams,
  SubcategoryStatisticsParams,
  TopCategoryStatisticsParams,
  StatisticsBase,
} from "@/types/statistics";

function StatisticsPageContent() {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<StatisticsTabType>("item");
  const [period, setPeriod] = useState<PeriodType>("daily");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Search params for each tab
  const [itemParams, setItemParams] = useState<ItemStatisticsParams>({
    itemName: "",
    subCategory: "",
    topCategory: "",
  });
  const [subcategoryParams, setSubcategoryParams] =
    useState<SubcategoryStatisticsParams>({
      topCategory: "",
      subCategory: "",
    });
  const [topCategoryParams, setTopCategoryParams] =
    useState<TopCategoryStatisticsParams>({
      topCategory: "",
    });

  const updateStatisticsUrl = useCallback(
    (
      tab: StatisticsTabType,
      item: ItemStatisticsParams,
      subcategory: SubcategoryStatisticsParams,
      topCategory: TopCategoryStatisticsParams,
    ) => {
      const params = new URLSearchParams();
      params.set("tab", tab);

      if (tab === "item") {
        if (item.itemName) params.set("itemName", item.itemName);
        if (item.topCategory) params.set("topCategory", item.topCategory);
        if (item.subCategory) params.set("subCategory", item.subCategory);
      } else if (tab === "subcategory") {
        if (subcategory.topCategory) params.set("topCategory", subcategory.topCategory);
        if (subcategory.subCategory) params.set("subCategory", subcategory.subCategory);
      } else if (topCategory.topCategory) {
        params.set("topCategory", topCategory.topCategory);
      }

      const query = params.toString();
      router.replace(query ? `/statistics?${query}` : "/statistics");
    },
    [router],
  );

  useEffect(() => {
    const rawTab = urlSearchParams.get("tab");
    const nextTab: StatisticsTabType =
      rawTab === "subcategory" || rawTab === "top-category" || rawTab === "item"
        ? rawTab
        : "item";
    const nextTopCategory = urlSearchParams.get("topCategory") || "";
    const nextSubCategory = urlSearchParams.get("subCategory") || "";
    const nextItemName = urlSearchParams.get("itemName") || "";

    setActiveTab(nextTab);
    setItemParams({
      itemName: nextItemName,
      topCategory: nextTopCategory,
      subCategory: nextSubCategory,
    });
    setSubcategoryParams({
      topCategory: nextTopCategory,
      subCategory: nextSubCategory,
    });
    setTopCategoryParams({
      topCategory: nextTopCategory,
    });
  }, [urlSearchParams]);

  // Build params with dates
  const itemParamsWithDates = useMemo(
    () => ({ ...itemParams, dateFrom, dateTo }),
    [itemParams, dateFrom, dateTo],
  );
  const subcategoryParamsWithDates = useMemo(
    () => ({ ...subcategoryParams, dateFrom, dateTo }),
    [subcategoryParams, dateFrom, dateTo],
  );
  const topCategoryParamsWithDates = useMemo(
    () => ({ ...topCategoryParams, dateFrom, dateTo }),
    [topCategoryParams, dateFrom, dateTo],
  );

  // Hook calls (all always called, but `enabled` controls fetching)
  const itemDaily = useItemDailyStatistics(itemParamsWithDates);
  const itemWeekly = useItemWeeklyStatistics(itemParamsWithDates);
  const subcatDaily = useSubcategoryDailyStatistics(
    subcategoryParamsWithDates,
  );
  const subcatWeekly = useSubcategoryWeeklyStatistics(
    subcategoryParamsWithDates,
  );
  const topCatDaily = useTopCategoryDailyStatistics(
    topCategoryParamsWithDates,
  );
  const topCatWeekly = useTopCategoryWeeklyStatistics(
    topCategoryParamsWithDates,
  );

  // Get current data based on active tab and period
  const currentQuery = useMemo(() => {
    if (activeTab === "item") {
      return period === "daily" ? itemDaily : itemWeekly;
    }
    if (activeTab === "subcategory") {
      return period === "daily" ? subcatDaily : subcatWeekly;
    }
    return period === "daily" ? topCatDaily : topCatWeekly;
  }, [
    activeTab,
    period,
    itemDaily,
    itemWeekly,
    subcatDaily,
    subcatWeekly,
    topCatDaily,
    topCatWeekly,
  ]);

  const chartData: (StatisticsBase & {
    date?: string;
    weekStart?: string;
    weekEnd?: string;
  })[] = (currentQuery.data as typeof chartData) ?? [];

  const isLoading = currentQuery.isLoading;
  const hasSearched = useMemo(() => {
    if (activeTab === "item")
      return !!itemParams.itemName && !!itemParams.topCategory;
    if (activeTab === "subcategory")
      return !!subcategoryParams.topCategory && !!subcategoryParams.subCategory;
    return !!topCategoryParams.topCategory;
  }, [activeTab, itemParams, subcategoryParams, topCategoryParams]);

  const handleSearch = useCallback((params: {
    topCategory: string;
    subCategory: string;
    itemName: string;
  }) => {
    if (activeTab === "item") {
      const nextItemParams = {
        itemName: params.itemName,
        subCategory: params.subCategory,
        topCategory: params.topCategory,
      };
      setItemParams(nextItemParams);
      updateStatisticsUrl(
        activeTab,
        nextItemParams,
        subcategoryParams,
        topCategoryParams,
      );
    } else if (activeTab === "subcategory") {
      const nextSubcategoryParams = {
        topCategory: params.topCategory,
        subCategory: params.subCategory,
      };
      setSubcategoryParams(nextSubcategoryParams);
      updateStatisticsUrl(
        activeTab,
        itemParams,
        nextSubcategoryParams,
        topCategoryParams,
      );
    } else {
      const nextTopCategoryParams = {
        topCategory: params.topCategory,
      };
      setTopCategoryParams(nextTopCategoryParams);
      updateStatisticsUrl(
        activeTab,
        itemParams,
        subcategoryParams,
        nextTopCategoryParams,
      );
    }
  }, [
    activeTab,
    itemParams,
    subcategoryParams,
    topCategoryParams,
    updateStatisticsUrl,
  ]);

  const handleTabChange = useCallback(
    (tab: StatisticsTabType) => {
      setActiveTab(tab);
      updateStatisticsUrl(tab, itemParams, subcategoryParams, topCategoryParams);
    },
    [itemParams, subcategoryParams, topCategoryParams, updateStatisticsUrl],
  );

  const maxRange =
    period === "daily" ? "최대 30일" : "최대 4개월";

  return (
    <div className="select-none min-h-full bg-[var(--color-ds-background)] dark:bg-navy-900 -mx-4 md:-mx-6 -my-6 md:-my-8">
      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-4 md:pt-6 pb-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">
            시세 정보
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            아이템 및 카테고리별 가격 추이와 거래 통계를 확인하세요
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-4">
          <StatisticsTabs activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        {/* Search Form */}
        <div className="bg-white dark:bg-navy-700 rounded-2xl p-4 md:p-6 shadow-xl border border-gray-100 dark:border-navy-600 mb-4">
          <StatisticsSearchForm
            activeTab={activeTab}
            topCategory={
              activeTab === "item"
                ? itemParams.topCategory
                : activeTab === "subcategory"
                  ? subcategoryParams.topCategory
                  : topCategoryParams.topCategory
            }
            subCategory={
              activeTab === "item"
                ? itemParams.subCategory
                : activeTab === "subcategory"
                  ? subcategoryParams.subCategory
                  : ""
            }
            itemName={activeTab === "item" ? itemParams.itemName : ""}
            onTopCategoryChange={(value) => {
              if (activeTab === "item") {
                setItemParams((prev) => ({
                  ...prev,
                  topCategory: value,
                  subCategory: "",
                }));
              } else if (activeTab === "subcategory") {
                setSubcategoryParams((prev) => ({
                  ...prev,
                  topCategory: value,
                  subCategory: "",
                }));
              } else {
                setTopCategoryParams({ topCategory: value });
              }
            }}
            onSubCategoryChange={(value) => {
              if (activeTab === "item") {
                setItemParams((prev) => ({ ...prev, subCategory: value }));
              } else if (activeTab === "subcategory") {
                setSubcategoryParams((prev) => ({ ...prev, subCategory: value }));
              }
            }}
            onItemNameChange={(value) => {
              if (activeTab === "item") {
                setItemParams((prev) => ({ ...prev, itemName: value }));
              }
            }}
            onSearch={handleSearch}
          />
        </div>

        {/* Period Toggle + Date Range */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <PeriodToggle period={period} onPeriodChange={setPeriod} />
          <DateRangeSelector
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            maxRange={maxRange}
          />
        </div>

        {/* Content */}
        {!hasSearched ? (
          <div className="bg-white dark:bg-navy-700 rounded-2xl p-12 shadow-xl border border-gray-100 dark:border-navy-600 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <svg
                className="w-12 h-12 mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              위 검색 조건을 입력하고 조회 버튼을 클릭해주세요
            </p>
          </div>
        ) : isLoading ? (
          <StatisticsSkeleton />
        ) : chartData.length === 0 ? (
          <div className="bg-white dark:bg-navy-700 rounded-2xl p-12 shadow-xl border border-gray-100 dark:border-navy-600 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              조회 결과가 없습니다
            </p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {/* Summary Cards */}
            <StatisticsSummaryCards data={chartData} />

            {/* Price Chart */}
            <PriceChart data={chartData} />

            {/* Volume Chart */}
            <VolumeChart data={chartData} />

            {/* Data Table */}
            <StatisticsTable
              data={chartData}
              isWeekly={period === "weekly"}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function StatisticsPage() {
  return (
    <Suspense fallback={<StatisticsSkeleton />}>
      <StatisticsPageContent />
    </Suspense>
  );
}
