"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { usePriceSurgeRanking, usePriceDropRanking } from "@/hooks/useRankings";
import { formatKoreanNumber, formatChangeRate, getRankMedal } from "./utils";
import RankingCardSkeleton from "./RankingCardSkeleton";
import { PriceChangeRankingResponse } from "@/types/ranking";

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
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
        데이터를 불러올 수 없습니다
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
        랭킹 데이터가 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.slice(0, 10).map((item) => (
        <div
          key={`${item.rank}-${item.itemName}`}
          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-navy-700/50 transition-colors cursor-pointer group"
        >
          {/* Rank */}
          <div className="w-6 text-center">
            {item.rank <= 3 ? (
              <span className="text-base">{getRankMedal(item.rank)}</span>
            ) : (
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                {item.rank}
              </span>
            )}
          </div>

          {/* Item Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-blaanid-600 dark:group-hover:text-blaanid-400 transition-colors">
              {item.itemName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {item.itemTopCategory} &gt; {item.itemSubCategory}
            </p>
          </div>

          {/* Stats */}
          <div className="text-right shrink-0">
            <p className={`text-sm font-bold ${changeTextClass}`}>
              {formatChangeRate(item.changeRate)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
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
export function PriceSurgeCard() {
  const { data, isLoading, error } = usePriceSurgeRanking(10);

  return (
    <div className="bg-white dark:bg-navy-800 rounded-[20px] border border-gray-200 dark:border-navy-600 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-none p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <ArrowUpRight className="w-4 h-4 text-red-500 dark:text-red-400" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">
            가격 급등 TOP 10
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            어제 대비 변동률
          </p>
        </div>
      </div>

      <PriceChangeCardContent
        data={data}
        isLoading={isLoading}
        error={error}
        isSurge={true}
        changeTextClass="text-red-500 dark:text-red-400"
      />
    </div>
  );
}

// Drop Card Component
export function PriceDropCard() {
  const { data, isLoading, error } = usePriceDropRanking(10);

  return (
    <div className="bg-white dark:bg-navy-800 rounded-[20px] border border-gray-200 dark:border-navy-600 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-none p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
          <ArrowDownRight className="w-4 h-4 text-blue-500 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">
            가격 급락 TOP 10
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            어제 대비 변동률
          </p>
        </div>
      </div>

      <PriceChangeCardContent
        data={data}
        isLoading={isLoading}
        error={error}
        isSurge={false}
        changeTextClass="text-blue-500 dark:text-blue-400"
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
