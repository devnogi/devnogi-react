"use client";

import { Crown } from "lucide-react";
import { useAllTimeHighestPriceRanking } from "@/hooks/useRankings";
import { formatKoreanNumber, formatDateTime } from "./utils";

export default function AllTimeHighlightCard() {
  const { data, isLoading, error } = useAllTimeHighestPriceRanking(5);

  const getMedalStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg shadow-yellow-500/30";
      case 2:
        return "bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-lg shadow-gray-400/30";
      case 3:
        return "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30";
      default:
        return "bg-gray-100 dark:bg-navy-700 text-gray-600 dark:text-gray-300";
    }
  };

  return (
    <div className="bg-gradient-to-br from-gold-50 via-white to-blaanid-50 dark:from-navy-800 dark:via-navy-800 dark:to-navy-700 rounded-[20px] border border-gold-200 dark:border-navy-600 shadow-[0_8px_24px_rgba(238,178,51,0.12)] dark:shadow-none p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center">
          <Crown className="w-5 h-5 text-gold-600 dark:text-gold-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
            역대 최고가 거래
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            전체 기간 최고 단가 TOP 5
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/60 dark:bg-navy-700/50 rounded-2xl p-4 animate-pulse"
            >
              <div className="w-8 h-8 bg-gray-200 dark:bg-navy-600 rounded-full mx-auto mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-navy-600 rounded w-full mb-2" />
              <div className="h-5 bg-gray-200 dark:bg-navy-600 rounded w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
          데이터를 불러올 수 없습니다
        </div>
      ) : !data || data.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
          랭킹 데이터가 없습니다
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {data.map((item) => (
            <div
              key={`${item.rank}-${item.itemName}`}
              className="bg-white/80 dark:bg-navy-700/60 rounded-2xl p-4 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer group"
            >
              {/* Rank Badge */}
              <div
                className={`w-8 h-8 rounded-full mx-auto mb-3 flex items-center justify-center font-bold text-sm ${getMedalStyle(item.rank)}`}
              >
                {item.rank}
              </div>

              {/* Item Name */}
              <p className="font-medium text-sm text-gray-900 dark:text-gray-100 text-center truncate mb-1 group-hover:text-blaanid-600 dark:group-hover:text-blaanid-400 transition-colors">
                {item.itemName}
              </p>

              {/* Category */}
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center truncate mb-2">
                {item.itemTopCategory}
              </p>

              {/* Price */}
              <p className="text-base font-bold text-gold-600 dark:text-gold-400 text-center">
                {formatKoreanNumber(item.auctionPricePerUnit)}
              </p>

              {/* Date */}
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
                {formatDateTime(item.dateAuctionBuy)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
