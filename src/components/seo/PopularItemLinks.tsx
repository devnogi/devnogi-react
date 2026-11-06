"use client";

import Link from "next/link";

import { useTodayPopularRanking } from "@/hooks/useRankings";

export default function PopularItemLinks() {
  const { data } = useTodayPopularRanking(7);
  if (!data?.length) return null;

  return (
    <nav
      aria-label="오늘 많이 거래된 아이템"
      className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-white [text-shadow:0_1px_3px_#000]"
    >
      <span className="text-xs font-medium text-stone-200">
        오늘 많이 거래된 아이템
      </span>
      {data.slice(0, 3).map((item) => (
        <Link
          key={item.rank}
          href={{
            pathname: "/auction-history",
            query: {
              item_name: item.itemName,
              top_category: item.itemTopCategory,
              sub_category: item.itemSubCategory,
            },
          }}
          className="max-w-full truncate py-1 font-medium underline-offset-4 hover:underline focus-visible:outline-2"
        >
          {item.itemName}
        </Link>
      ))}
    </nav>
  );
}
