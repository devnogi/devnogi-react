"use client";

import { useAllTimeHighestPriceRanking } from "@/hooks/useRankings";

import RankingCardSkeleton from "./RankingCardSkeleton";
import RankingRow from "./RankingRow";
import { formatDateTime, formatKoreanNumber } from "./utils";

export default function AllTimeHighlightCard() {
  const { data, isLoading, error } = useAllTimeHighestPriceRanking(7);
  return (
    <div className="h-full min-w-0 rounded-lg border border-gray-200 bg-[var(--color-ds-card)] p-4 tabular-nums dark:border-navy-600 dark:bg-navy-800">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
          역대 최고가 거래
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          전체 기간 최고 단가 TOP 7
        </p>
      </div>
      {isLoading ? (
        <RankingCardSkeleton rows={7} compact />
      ) : error ? (
        <div className="py-8 text-center text-sm text-gray-600 dark:text-gray-300">
          데이터를 불러올 수 없습니다
        </div>
      ) : !data || data.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-600 dark:text-gray-300">
          랭킹 데이터가 없습니다
        </div>
      ) : (
        <ol>
          {data.slice(0, 7).map((item) => (
            <RankingRow
              key={item.rank + "-" + item.itemName}
              rank={item.rank}
              name={item.itemName}
              category={item.itemTopCategory}
              value={formatKoreanNumber(item.auctionPricePerUnit)}
              detail={formatDateTime(item.dateAuctionBuy)}
            />
          ))}
        </ol>
      )}
    </div>
  );
}
