"use client";

import { Sparkles, BarChart3 } from "lucide-react";
import {
  PopularRankingCard,
  PriceChangeCard,
  AllTimeHighlightCard,
  VolumeSurgeCard,
  MonthLargestCard,
} from "@/components/page/home";

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-6 md:py-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-6 h-6 text-gold-400" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50">
            마비노기 경매장 랭킹
          </h1>
          <Sparkles className="w-6 h-6 text-gold-400" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
          실시간 거래 데이터 기반 인기 아이템 및 시세 변동 정보
        </p>
      </section>

      {/* Quick Stats - 3 Column Grid */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blaanid-500 dark:text-blaanid-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            오늘의 시세 현황
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <PopularRankingCard />
          <PriceChangeCard type="surge" />
          <PriceChangeCard type="drop" />
        </div>
      </section>

      {/* All-Time Highlight */}
      <section>
        <AllTimeHighlightCard />
      </section>

      {/* Two Column Stats */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <MonthLargestCard />
          <VolumeSurgeCard />
        </div>
      </section>

      {/* Footer Note */}
      <section className="text-center py-4">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          데이터는 5분마다 자동으로 갱신됩니다
        </p>
      </section>
    </div>
  );
}
