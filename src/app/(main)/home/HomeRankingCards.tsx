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
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <PopularRankingCard />
        <HornBugleCard />
      </div>
      <div className="mt-6 grid grid-cols-1 items-start gap-6 border-t border-border pt-6 md:mt-8 md:pt-8 lg:grid-cols-2">
        <MonthLargestCard />
        <HomePopularPosts />
      </div>
    </section>
  );
}
