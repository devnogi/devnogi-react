"use client";

import {
  AllTimeHighlightCard,
  MonthLargestCard,
  PopularRankingCard,
  PriceChangeCard,
  VolumeSurgeCard,
} from "@/components/page/home";

export default function HomeRankingCards() {
  return (
    <>
      <section aria-labelledby="market-summary-heading">
        <h2
          id="market-summary-heading"
          className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50"
        >
          오늘의 시세 현황
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          <PopularRankingCard />
          <PriceChangeCard type="surge" />
          <PriceChangeCard type="drop" />
        </div>
      </section>

      <section aria-label="주요 시세 지표">
        <AllTimeHighlightCard />
      </section>

      <section aria-label="거래량과 월간 시세">
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
          <MonthLargestCard />
          <VolumeSurgeCard />
        </div>
      </section>
    </>
  );
}
