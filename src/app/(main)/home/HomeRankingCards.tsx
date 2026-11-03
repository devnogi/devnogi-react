"use client";

import {
  AllTimeHighlightCard,
  HornBugleCard,
  MonthLargestCard,
  PopularRankingCard,
} from "@/components/page/home";

export default function HomeRankingCards() {
  return (
    <section aria-labelledby="market-summary-heading">
      <h1 id="market-summary-heading" className="sr-only">
        오늘의 시세 현황
      </h1>
      <div className="grid auto-rows-fr grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        <PopularRankingCard />
        <HornBugleCard />
        <MonthLargestCard />
        <AllTimeHighlightCard />
      </div>
    </section>
  );
}
