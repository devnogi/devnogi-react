import type { Metadata } from "next";
import Link from "next/link";

import { itemCategories } from "@/data/item-category";
import { canonicalUrl } from "@/lib/seo/site";

import AuctionHistoryClient from "./AuctionHistoryClient";
import { type AuctionSearchParams, getAuctionSearchMetadata } from "./seo";

type AuctionHistoryPageProps = {
  searchParams: Promise<AuctionSearchParams>;
};

export async function generateMetadata({
  searchParams,
}: AuctionHistoryPageProps): Promise<Metadata> {
  return getAuctionSearchMetadata(await searchParams);
}

export default function AuctionHistoryPage() {
  const categories = itemCategories
    .flatMap((category) => category.children ?? [])
    .slice(0, 8);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "마비노기 경매장 거래내역·아이템 시세 검색",
    description:
      "마비노기 경매장 거래내역을 아이템명과 카테고리로 검색하는 메모노기 페이지입니다.",
    isPartOf: {
      "@type": "WebSite",
      name: "메모노기",
      url: canonicalUrl(),
    },
  };

  return (
    <>
      <section
        aria-labelledby="auction-history-title"
        className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-navy-600 dark:bg-navy-800 md:p-7"
      >
        <p className="mb-2 text-sm font-medium text-blue-700 dark:text-coral-300">
          메모노기 경매장
        </p>
        <h1
          id="auction-history-title"
          className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl"
        >
          마비노기 경매장 거래내역·아이템 시세 검색
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300 md:text-base">
          아이템명과 카테고리, 가격·기간·옵션 조건으로 마비노기 경매장
          거래내역을 찾아볼 수 있습니다. 결과는 NEXON Open API를 기반으로
          제공되며, 게임 안의 현재 상태와 차이가 있을 수 있습니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link
            className="font-medium text-blue-700 underline-offset-4 hover:underline dark:text-coral-300"
            href="/auction-realtime"
          >
            경매장 실시간 정보 보기
          </Link>
          <Link
            className="font-medium text-blue-700 underline-offset-4 hover:underline dark:text-coral-300"
            href="/statistics"
          >
            시세 정보 보기
          </Link>
          <Link
            className="font-medium text-blue-700 underline-offset-4 hover:underline dark:text-coral-300"
            href="/item-info"
          >
            아이템 정보 보기
          </Link>
        </div>
        <div className="mt-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            자주 찾는 카테고리
          </h2>
          <ul
            className="mt-2 flex flex-wrap gap-2"
            aria-label="경매장 카테고리"
          >
            {categories.map((category) => {
              const [topCategory, subCategory] = category.id.split("/");
              const params = new URLSearchParams({
                top_category: topCategory,
                ...(subCategory ? { sub_category: subCategory } : {}),
              });
              return (
                <li key={category.id}>
                  <Link
                    className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-sm text-blue-800 hover:bg-blue-100 dark:bg-navy-700 dark:text-coral-200 dark:hover:bg-navy-600"
                    href={`/auction-history?${params.toString()}`}
                  >
                    {category.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
      <AuctionHistoryClient />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
