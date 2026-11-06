"use client";

import { usePriceDropRanking, usePriceSurgeRanking } from "@/hooks/useRankings";
import { PriceChangeRankingResponse } from "@/types/ranking";

import RankingCardSkeleton from "./RankingCardSkeleton";
import { formatChangeRate, formatKoreanNumber } from "./utils";

interface PriceChangeCardContentProps {
  data: PriceChangeRankingResponse[] | undefined;
  isLoading: boolean;
  error: Error | null;
  isSurge: boolean;
  changeTextClass: string;
}

function PriceChangeCardContent({
  data,
  isLoading,
  error,
  isSurge,
  changeTextClass,
}: PriceChangeCardContentProps) {
  if (isLoading) {
    return <RankingCardSkeleton rows={5} />;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-300 text-sm">
        데이터를 불러올 수 없습니다
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-300 text-sm">
        랭킹 데이터가 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.slice(0, 10).map((item) => (
        <div
          key={`${item.rank}-${item.itemName}`}
          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-navy-700/50 transition-colors group"
        >
          {/* Rank */}
          <div className="w-6 text-center">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              {item.rank}
            </span>
          </div>

          {/* Item Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-primary transition-colors">
              {item.itemName}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
              {item.itemTopCategory} &gt; {item.itemSubCategory}
            </p>
          </div>

          {/* Stats */}
          <div className="text-right shrink-0">
            <p className={`text-sm font-bold ${changeTextClass}`}>
              {formatChangeRate(item.changeRate)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              {isSurge ? "+" : ""}
              {formatKoreanNumber(item.priceChange)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Surge Card Component
function PriceSurgeCard() {
  const { data, isLoading, error } = usePriceSurgeRanking(10);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 tabular-nums dark:border-navy-600 dark:bg-navy-800">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">
            가격 급등 TOP 10
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            어제 대비 변동률
          </p>
        </div>
      </div>

      <PriceChangeCardContent
        data={data}
        isLoading={isLoading}
        error={error}
        isSurge={true}
        changeTextClass="text-red-700 dark:text-red-300"
      />
    </div>
  );
}

// Drop Card Component
function PriceDropCard() {
  const { data, isLoading, error } = usePriceDropRanking(10);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 tabular-nums dark:border-navy-600 dark:bg-navy-800">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">
            가격 급락 TOP 10
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            어제 대비 변동률
          </p>
        </div>
      </div>

      <PriceChangeCardContent
        data={data}
        isLoading={isLoading}
        error={error}
        isSurge={false}
        changeTextClass="text-blue-700 dark:text-blue-300"
      />
    </div>
  );
}

// Legacy wrapper for backward compatibility
interface PriceChangeCardProps {
  type: "surge" | "drop";
}

export default function PriceChangeCard({ type }: PriceChangeCardProps) {
  if (type === "surge") {
    return <PriceSurgeCard />;
  }
  return <PriceDropCard />;
}
