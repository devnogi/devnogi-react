import { BarChart3, Search, Sparkles } from "lucide-react";
import Link from "next/link";

import HomeRankingCards from "@/app/(main)/home/HomeRankingCards";

const featureLinks = [
  {
    href: "/auction-history",
    title: "경매장 거래내역",
    description: "아이템명과 조건으로 최근 거래내역을 찾아보세요.",
  },
  {
    href: "/auction-realtime",
    title: "경매장 실시간 정보",
    description: "현재 등록된 경매장 매물을 조건에 맞게 살펴보세요.",
  },
  {
    href: "/statistics",
    title: "시세 정보",
    description: "거래량과 가격 변동을 기준으로 시세 흐름을 확인하세요.",
  },
  {
    href: "/item-info",
    title: "아이템 정보",
    description: "마비노기 아이템 정보를 검색하고 분류별로 확인하세요.",
  },
];

export default function HomeLanding() {
  return (
    <div className="space-y-8">
      <section
        className="py-6 text-center md:py-8"
        aria-labelledby="home-heading"
      >
        <div className="mb-3 flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-gold-400" aria-hidden="true" />
          <h1
            id="home-heading"
            className="text-2xl font-bold text-gray-900 dark:text-gray-50 md:text-3xl"
          >
            마비노기 경매장·시세·아이템 정보
          </h1>
          <Sparkles className="h-6 w-6 text-gold-400" aria-hidden="true" />
        </div>
        <p className="mx-auto max-w-2xl text-sm text-gray-600 dark:text-gray-400 md:text-base">
          메모노기에서 마비노기 경매장 거래내역, 시세 변화, 아이템 정보를
          한곳에서 확인하세요.
        </p>
      </section>

      <section aria-labelledby="feature-heading">
        <div className="mb-4 flex items-center gap-2">
          <Search
            className="h-5 w-5 text-blaanid-500 dark:text-blaanid-400"
            aria-hidden="true"
          />
          <h2
            id="feature-heading"
            className="text-lg font-semibold text-gray-900 dark:text-gray-50"
          >
            메모노기 주요 기능
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {featureLinks.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-blaanid-300 hover:bg-blaanid-50 dark:border-navy-600 dark:bg-navy-800 dark:hover:border-blaanid-500 dark:hover:bg-navy-700"
            >
              <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section
        className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-navy-600 dark:bg-navy-800"
        aria-labelledby="data-source-heading"
      >
        <div className="flex items-center gap-2">
          <BarChart3
            className="h-5 w-5 text-blaanid-500 dark:text-blaanid-400"
            aria-hidden="true"
          />
          <h2
            id="data-source-heading"
            className="text-lg font-semibold text-gray-900 dark:text-gray-50"
          >
            데이터 안내
          </h2>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          이 서비스의 경매장 정보는 NEXON Open API를 기반으로 제공합니다. 게임
          내 실제 정보와 차이가 있을 수 있으므로 거래 전에는 게임에서 다시
          확인해 주세요.
        </p>
      </section>

      <HomeRankingCards />
    </div>
  );
}
