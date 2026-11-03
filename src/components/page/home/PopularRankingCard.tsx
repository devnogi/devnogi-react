"use client";

import { useTodayPopularRanking } from "@/hooks/useRankings";

import RankingCardSkeleton from "./RankingCardSkeleton";
import RankingRow from "./RankingRow";
import { formatKoreanNumber } from "./utils";

export default function PopularRankingCard() {
  const { data, isLoading, error } = useTodayPopularRanking(7);

  return (
    <div className="h-full min-w-0 rounded-lg border border-gray-200 bg-[var(--color-ds-card)] p-4 tabular-nums dark:border-navy-600 dark:bg-navy-800">
      <div className="mb-2">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
          오늘의 인기 아이템
        </h3>
      </div>
      {isLoading ? (
        <RankingCardSkeleton rows={7} compact />
      ) : error ? (
        <div className="text-center py-8 text-gray-600 dark:text-gray-300 text-sm">
          데이터를 불러올 수 없습니다
        </div>
      ) : !data || data.length === 0 ? (
        <div className="text-center py-8 text-gray-600 dark:text-gray-300 text-sm">
          랭킹 데이터가 없습니다
        </div>
      ) : (
        <ol>
          {data.slice(0, 7).map((item) => (
            <RankingRow
              key={item.rank + "-" + item.itemName}
              rank={item.rank}
              name={item.itemName}
              category={item.itemTopCategory + " > " + item.itemSubCategory}
              value={formatKoreanNumber(item.totalQuantity) + "개"}
              detail={"평균 " + formatKoreanNumber(item.avgPrice)}
              accent
            />
          ))}
        </ol>
      )}
    </div>
  );
}
