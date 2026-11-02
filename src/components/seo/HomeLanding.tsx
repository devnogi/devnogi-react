import {
  BarChart3,
  BookOpen,
  Gavel,
  Info,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import HomeRankingCards from "@/app/(main)/home/HomeRankingCards";

import styles from "./HomeLanding.module.css";

const featureLinks = [
  {
    href: "/auction-history",
    title: "경매장 거래내역",
    description: "아이템명과 조건으로 최근 거래내역을 찾아보세요.",
    icon: Gavel,
    color: "text-[#b9502b] dark:text-orange-300",
  },
  {
    href: "/auction-realtime",
    title: "경매장 실시간 정보",
    description: "현재 등록된 경매장 매물을 조건에 맞게 살펴보세요.",
    icon: TrendingUp,
    color: "text-[#ad6900] dark:text-amber-300",
  },
  {
    href: "/statistics",
    title: "시세 정보",
    description: "거래량과 가격 변동을 기준으로 시세 흐름을 확인하세요.",
    icon: BarChart3,
    color: "text-[#617a35] dark:text-lime-300",
  },
  {
    href: "/item-info",
    title: "아이템 정보",
    description: "마비노기 아이템 정보를 검색하고 분류별로 확인하세요.",
    icon: BookOpen,
    color: "text-[#b9502b] dark:text-orange-300",
  },
];

export default function HomeLanding() {
  return (
    <div
      className={`${styles.home} relative left-1/2 -mt-6 -mb-6 w-screen -translate-x-1/2 bg-white md:-mt-8 md:-mb-8 dark:bg-navy-900`}
    >
      <section
        className="relative flex min-h-[220px] items-center justify-center overflow-hidden px-4 py-10 text-center md:h-[240px]"
        aria-labelledby="home-heading"
      >
        <Image
          src="/home-hero-village.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="relative max-w-3xl rounded-2xl bg-white/90 px-5 py-5 dark:bg-navy-900/90 sm:px-8">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Sparkles
              className="h-6 w-6 shrink-0 text-amber-600 dark:text-amber-300"
              aria-hidden="true"
            />
            <h1
              id="home-heading"
              className="text-2xl font-bold text-gray-900 dark:text-gray-50 md:text-3xl"
            >
              마비노기 경매장·시세·아이템 정보
            </h1>
            <Sparkles
              className="h-6 w-6 shrink-0 text-amber-600 dark:text-amber-300"
              aria-hidden="true"
            />
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-200 md:text-base">
            메모노기에서 마비노기 경매장 거래내역, 시세 변화, 아이템 정보를
            한곳에서 확인하세요.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full space-y-8 px-4 py-8 sm:px-6 lg:w-[60%] lg:max-w-[1000px] lg:px-0 lg:py-10">
        <section aria-labelledby="feature-heading">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen
              className="h-5 w-5 text-[#b9502b] dark:text-orange-300"
              aria-hidden="true"
            />
            <h2
              id="feature-heading"
              className="text-lg font-semibold text-gray-900 dark:text-gray-50"
            >
              메모노기 주요 기능
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            {featureLinks.map(
              ({ href, title, description, icon: Icon, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex min-h-24 items-start gap-4 rounded-lg border-b border-[#eaded5] px-3 py-4 transition-colors hover:bg-[#fff7f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a63f20] dark:border-navy-600 dark:hover:bg-navy-800"
                >
                  <Icon
                    className={`mt-0.5 h-6 w-6 shrink-0 ${color}`}
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
              ),
            )}
          </div>
        </section>

        <section
          className="rounded-xl bg-[#f1f5eb] p-5 dark:bg-navy-800"
          aria-labelledby="data-source-heading"
        >
          <div className="flex items-center gap-2">
            <Info
              className="h-5 w-5 text-[#476a32] dark:text-lime-300"
              aria-hidden="true"
            />
            <h2
              id="data-source-heading"
              className="text-lg font-semibold text-[#36532a] dark:text-gray-50"
            >
              데이터 안내
            </h2>
          </div>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            이 서비스의 경매장 정보는 NEXON Open API를 기반으로 제공합니다. 게임
            내 실제 정보와 차이가 있을 수 있으므로 거래 전에는 게임에서 다시
            확인해 주세요.
          </p>
        </section>

        <HomeRankingCards />
      </div>
    </div>
  );
}
