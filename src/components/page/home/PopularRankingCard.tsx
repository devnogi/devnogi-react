"use client";

import { TrendingUp } from "lucide-react";
import { useTodayPopularRanking } from "@/hooks/useRankings";
import { formatKoreanNumber, getRankMedal } from "./utils";
import RankingCardSkeleton from "./RankingCardSkeleton";

export default function PopularRankingCard() {
  const { data, isLoading, error } = useTodayPopularRanking(10);

  return (
    <div className="bg-white dark:bg-navy-800 rounded-[20px] border border-gray-200 dark:border-navy-600 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-none p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-blaanid-50 dark:bg-blaanid-900/30 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-blaanid-600 dark:text-blaanid-400" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">
            오늘의 인기 아이템
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            거래량 기준 TOP 10
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <RankingCardSkeleton rows={5} />
      ) : error ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
          데이터를 불러올 수 없습니다
        </div>
      ) : !data || data.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
          랭킹 데이터가 없습니다
        </div>
      ) : (
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
                <p className="text-sm font-semibold text-blaanid-600 dark:text-blaanid-400">
                  {formatKoreanNumber(item.totalQuantity)}개
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
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
