"use client";

import { useMonthLargestVolumeRanking } from "@/hooks/useRankings";

import styles from "./HomeCards.module.css";
import RankingCardSkeleton from "./RankingCardSkeleton";
import RankingRow from "./RankingRow";
import { formatDateTime, formatKoreanNumber } from "./utils";

export default function MonthLargestCard() {
  const { data, isLoading, error } = useMonthLargestVolumeRanking(7);

  return (
    <div className={styles.card}>
      <div className={styles.heading}>
        <h3 className={styles.title}>이번 달 최대 거래액</h3>
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
          {data.slice(0, 7).map((item, index) => (
            <RankingRow
              key={item.rank + "-" + item.itemName}
              rank={item.rank}
              featured={index === 0}
              name={item.itemDisplayName || item.itemName}
              category={item.itemTopCategory + " > " + item.itemSubCategory}
              value={formatKoreanNumber(item.totalPrice) + " G"}
              detail={formatDateTime(item.dateAuctionBuy)}
            />
          ))}
        </ol>
      )}
    </div>
  );
}
