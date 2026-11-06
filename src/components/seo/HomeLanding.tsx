import {
  BarChart3,
  BookOpen,
  ChevronDown,
  Gavel,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import HomeRankingCards from "@/app/(main)/home/HomeRankingCards";
import { HomeSearch } from "@/components/navigation/HomeSearch";

import HomeHeroCarousel from "./HomeHeroCarousel";
import styles from "./HomeLanding.module.css";
import PopularItemLinks from "./PopularItemLinks";

const featureLinks = [
  {
    href: "/auction-history",
    title: "경매장 거래내역",
    description: "아이템명과 조건으로 최근 거래내역을 찾아보세요.",
    icon: Gavel,
  },
  {
    href: "/auction-realtime",
    title: "경매장 실시간 정보",
    description: "현재 등록된 경매장 매물을 조건에 맞게 살펴보세요.",
    icon: TrendingUp,
  },
  {
    href: "/statistics",
    title: "시세 정보",
    description: "거래량과 가격 변동을 기준으로 시세 흐름을 확인하세요.",
    icon: BarChart3,
  },
  {
    href: "/item-info",
    title: "아이템 정보",
    description: "마비노기 아이템 정보를 검색하고 분류별로 확인하세요.",
    icon: BookOpen,
  },
];

export default function HomeLanding() {
  return (
    <div
      className={`${styles.home} relative left-1/2 -mt-6 -mb-6 w-screen -translate-x-1/2 bg-[var(--color-ds-background)] md:-mt-8 md:-mb-8 dark:bg-navy-900`}
    >
      <section
        className="relative flex min-h-[280px] items-center justify-center px-4 py-10 md:h-[320px]"
        aria-label="아이템 검색"
      >
        <HomeHeroCarousel />
        <div className="relative z-20 w-full max-w-2xl">
          <HomeSearch location="hero" />
          <PopularItemLinks />
        </div>
      </section>

      <div
        role="region"
        aria-label="홈 콘텐츠"
        className="relative z-10 mx-auto mt-6 w-[calc(100cqw_-_24px)] rounded-t-[20px] bg-[var(--color-ds-background)] px-4 py-8 sm:px-6 md:mt-8 md:rounded-t-[24px] lg:w-[66.7vw] lg:max-w-[1120px] lg:px-0 lg:py-10 dark:bg-navy-800"
      >
        <div className="mx-auto w-full space-y-8 lg:w-[60vw] lg:max-w-[1000px]">
          <HomeRankingCards />
          <details className="group border-t border-gray-200 dark:border-navy-600">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-sm px-1 text-sm font-semibold text-gray-700 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:text-gray-300 dark:hover:text-gray-50 [&::-webkit-details-marker]:hidden">
              주요 기능 보기
              <ChevronDown
                aria-hidden="true"
                className="h-4 w-4 group-open:rotate-180"
              />
            </summary>
            <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              {featureLinks.map(({ href, title, description, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex min-h-24 items-start gap-4 border-b border-gray-200 px-3 py-4 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:border-navy-600 dark:hover:bg-navy-700"
                >
                  <Icon
                    className="mt-0.5 h-5 w-5 shrink-0 text-gray-600 dark:text-gray-300"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </details>

          <section
            className="border-t border-gray-200 pt-6 dark:border-navy-600"
            aria-labelledby="data-source-heading"
          >
            <div className="flex items-center gap-2">
              <h2
                id="data-source-heading"
                className="text-lg font-semibold text-gray-900 dark:text-gray-50"
              >
                데이터 안내
              </h2>
            </div>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              이 서비스의 경매장 정보는 NEXON Open API를 기반으로 제공합니다.
              게임 내 실제 정보와 차이가 있을 수 있으므로 거래 전에는 게임에서
              다시 확인해 주세요.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
