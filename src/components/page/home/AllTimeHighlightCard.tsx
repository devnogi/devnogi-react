"use client";

import { useAllTimeHighestPriceRanking } from "@/hooks/useRankings";

import RankingCardSkeleton from "./RankingCardSkeleton";
import { formatDateTime, formatKoreanNumber } from "./utils";

export default function AllTimeHighlightCard() {
  const { data, isLoading, error } = useAllTimeHighestPriceRanking(7);
  return (
    <div className="h-full min-w-0 rounded-lg border border-gray-200 bg-[var(--color-ds-card)] p-5 tabular-nums dark:border-navy-600 dark:bg-navy-800">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-50">
          역대 최고가 거래
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          전체 기간 최고 단가 TOP 7
        </p>
      </div>
      {isLoading ? (
        <RankingCardSkeleton rows={7} />
      ) : error ? (
        <div className="py-8 text-center text-sm text-gray-600 dark:text-gray-300">
          데이터를 불러올 수 없습니다
        </div>
      ) : !data || data.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-600 dark:text-gray-300">
          랭킹 데이터가 없습니다
        </div>
      ) : (
        <div className="space-y-2">
          {data.slice(0, 7).map((item) => (
            <div
              key={`${item.rank}-${item.itemName}`}
              className="flex items-center gap-2 rounded-xl px-1 py-2"
            >
              <span className="w-4 shrink-0 text-center text-sm font-semibold text-gray-600 dark:text-gray-300">
                {item.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {item.itemName}
                </p>
                <p className="truncate text-xs text-gray-600 dark:text-gray-300">
                  {item.itemTopCategory}
                </p>
              </div>
              <div className="shrink-0 text-right tabular-nums">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatKoreanNumber(item.auctionPricePerUnit)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {formatDateTime(item.dateAuctionBuy)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
