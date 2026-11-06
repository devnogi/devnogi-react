"use client";

import { useVolumeSurgeRanking } from "@/hooks/useRankings";

import RankingCardSkeleton from "./RankingCardSkeleton";
import { formatChangeRate, formatKoreanNumber } from "./utils";

export default function VolumeSurgeCard() {
  const { data, isLoading, error } = useVolumeSurgeRanking(10);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 tabular-nums dark:border-navy-600 dark:bg-navy-800">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">
            거래량 급증
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            어제 대비 거래량 변동
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <RankingCardSkeleton rows={5} />
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
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {formatChangeRate(item.changeRate)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  +{formatKoreanNumber(item.quantityChange)}개
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
