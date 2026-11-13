import type { Metadata } from "next";
import Link from "next/link";

import AuctionMarketSummary from "@/components/page/auction-common/AuctionMarketSummary";
import AuctionPageHeader from "@/components/page/auction-common/AuctionPageHeader";
import { itemCategories } from "@/data/item-category";
import { canonicalUrl } from "@/lib/seo/site";

import AuctionHistoryClient from "./AuctionHistoryClient";
import { type AuctionSearchParams, getAuctionSearchMetadata } from "./seo";

type AuctionHistoryPageProps = {
  searchParams: Promise<AuctionSearchParams>;
};

export const dynamic = "force-dynamic";

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
      <AuctionHistoryClient
        header={
          <AuctionPageHeader currentView="history">
            <AuctionMarketSummary />
            <div className="mt-2 flex flex-wrap gap-x-4 text-sm text-[var(--color-ds-text)]">
              <details className="group basis-full sm:basis-auto sm:flex-1">
                <summary className="min-h-11 cursor-pointer content-center rounded-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                  데이터 안내
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300 md:text-base">
                  아이템명과 카테고리, 가격·기간·옵션 조건으로 마비노기 경매장
                  거래내역을 찾아볼 수 있습니다. 결과는 NEXON Open API를
                  기반으로 제공되며, 게임 안의 현재 상태와 차이가 있을 수
                  있습니다.
                </p>
                <div className="my-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                  <Link
                    className="font-medium text-primary underline-offset-4 hover:underline"
                    href="/auction-realtime"
                  >
                    경매장 실시간 정보 보기
                  </Link>
                  <Link
                    className="font-medium text-primary underline-offset-4 hover:underline"
                    href="/statistics"
                  >
                    시세 정보 보기
                  </Link>
                  <Link
                    className="font-medium text-primary underline-offset-4 hover:underline"
                    href="/item-info"
                  >
                    아이템 정보 보기
                  </Link>
                </div>
              </details>
              <details className="basis-full sm:basis-auto sm:flex-1">
                <summary className="min-h-11 cursor-pointer content-center rounded-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                  자주 찾는 카테고리
                </summary>
                <ul
                  className="my-2 flex flex-wrap gap-2"
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
                          className="inline-flex min-h-11 items-center rounded-full bg-[var(--color-ds-primary-50)] px-3 py-1.5 text-sm text-primary hover:bg-[var(--color-ds-primary-100)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                          href={`/auction-history?${params.toString()}`}
                        >
                          {category.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </details>
            </div>
          </AuctionPageHeader>
        }
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
