"use client";

import { useTodayPopularRanking } from "@/hooks/useRankings";

import RankingCardSkeleton from "./RankingCardSkeleton";
import { formatKoreanNumber } from "./utils";

export default function PopularRankingCard() {
  const { data, isLoading, error } = useTodayPopularRanking(7);

  return (
    <div className="h-full min-w-0 rounded-lg border border-gray-200 bg-[var(--color-ds-card)] p-5 tabular-nums dark:border-navy-600 dark:bg-navy-800">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">
            오늘의 인기 아이템
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            거래량 기준 TOP 7
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <RankingCardSkeleton rows={7} />
      ) : error ? (
        <div className="text-center py-8 text-gray-600 dark:text-gray-300 text-sm">
          데이터를 불러올 수 없습니다
        </div>
      ) : !data || data.length === 0 ? (
        <div className="text-center py-8 text-gray-600 dark:text-gray-300 text-sm">
          랭킹 데이터가 없습니다
        </div>
      ) : (
        <div className="space-y-2">
          {data.slice(0, 7).map((item) => (
            <div
              key={`${item.rank}-${item.itemName}`}
              className="flex items-center gap-2 px-1 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-navy-700/50 transition-colors group"
            >
              {/* Rank */}
              <div className="w-4 shrink-0 text-center">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {item.rank}
                </span>
              </div>

              {/* Item Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-[#9a451f] dark:group-hover:text-orange-300 transition-colors">
                  {item.itemName}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                  {item.itemTopCategory} &gt; {item.itemSubCategory}
                </p>
              </div>

              {/* Stats */}
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-[#9a451f] dark:text-orange-300">
                  {formatKoreanNumber(item.totalQuantity)}개
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  평균 {formatKoreanNumber(item.avgPrice)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
