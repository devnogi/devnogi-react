"use client";

import {
  HomePopularPosts,
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
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        <HomePopularPosts />
        <HornBugleCard />
      </div>
      <div className="mt-4 grid grid-cols-1 items-start gap-4 border-t border-border pt-4 md:mt-6 md:pt-6 lg:grid-cols-2">
        <MonthLargestCard />
        <PopularRankingCard />
      </div>
    </section>
  );
}
