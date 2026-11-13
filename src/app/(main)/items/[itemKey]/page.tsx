import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import ItemMetadata from "@/components/page/items/ItemMetadata";
import ItemPriceHistory from "@/components/page/items/ItemPriceHistory";
import { getItemSeo, getItemStatistics } from "@/lib/items/data";
import { encodeItemKey, itemPath } from "@/lib/items/identity";
import { canonicalUrl, createPageMetadata } from "@/lib/seo/site";

interface Props {
  params: Promise<{ itemKey: string }>;
}
export const dynamic = "force-dynamic";

async function resolveItem(key: string) {
  const result = await getItemSeo(key);
  if (!result) notFound();
  if (encodeItemKey(result.item) !== key)
    permanentRedirect(itemPath(result.item));
  return result;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await resolveItem((await params).itemKey);
  return createPageMetadata({
    title: `${result.item.name} 시세·가격·아이템 정보`,
    description: `마비노기 ${result.item.name}의 경매장 시세, 판매 수량과 아이템 정보를 확인하세요. ${result.item.topCategory} · ${result.item.subCategory}.`,
    pathname: itemPath(result.item),
    robots: { index: result.seoEligible, follow: true },
  });
}

export default async function ItemPage({ params }: Props) {
  const { item, lastTrade } = await resolveItem((await params).itemKey);
  const statistics = await getItemStatistics(item);
  const query = new URLSearchParams({
    item_name: item.name,
    top_category: item.topCategory,
    sub_category: item.subCategory,
  });
  const breadcrumbs = [
    { name: "메모노기", url: canonicalUrl() },
    { name: "마비노기 경매장", url: canonicalUrl("/auction-history") },
    { name: item.name, url: canonicalUrl(itemPath(item)) },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.url,
    })),
  };
  const format = (value: number) => Math.round(value).toLocaleString("ko-KR");
  return (
    <article className="mx-auto max-w-6xl space-y-7 pb-8">
      <nav aria-label="현재 위치">
        <ol className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {breadcrumbs.map((entry, index) => (
            <li key={entry.url}>
              {index > 0 && (
                <span aria-hidden="true" className="mr-2">
                  /
                </span>
              )}
              {index === breadcrumbs.length - 1 ? (
                <span aria-current="page">{entry.name}</span>
              ) : (
                <Link href={entry.url}>{entry.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <header className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {item.topCategory} · {item.subCategory}
        </p>
        <h1 className="break-words text-2xl font-semibold sm:text-3xl">
          {item.name} 시세와 정보
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          마비노기 경매장 거래를 기준으로 살펴보는 아이템 가격과 판매
          수량입니다. 옵션이 다른 아이템의 거래도 함께 집계되므로 실제 거래
          전에는 개별 매물의 옵션을 확인해 주세요.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/auction-history?${query}`}
            className="inline-flex min-h-11 items-center rounded-lg border px-4 font-medium"
          >
            거래내역 검색
          </Link>
          <Link
            href={`/auction-realtime?${query}`}
            className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 font-medium text-primary-foreground"
          >
            현재 매물 검색
          </Link>
        </div>
      </header>
      {lastTrade && (
        <section
          className="rounded-xl border bg-card p-5"
          aria-labelledby="last-trade-heading"
        >
          <h2 id="last-trade-heading" className="text-lg font-semibold">
            마지막 보관 집계
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {lastTrade.periodStart}
            {lastTrade.periodType === "WEEKLY"
              ? ` ~ ${lastTrade.periodEnd} · 주간`
              : " · 일간"}
          </p>
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-muted-foreground">
                수량 가중 평균 가격
              </dt>
              <dd className="mt-1 font-semibold">
                {format(
                  lastTrade.totalQuantity > 0
                    ? lastTrade.totalVolume / lastTrade.totalQuantity
                    : lastTrade.avgPrice,
                )}{" "}
                골드
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">판매 수량</dt>
              <dd className="mt-1 font-semibold">
                {format(lastTrade.totalQuantity)}개
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">총 거래 금액</dt>
              <dd className="mt-1 font-semibold">
                {format(lastTrade.totalVolume)} 골드
              </dd>
            </div>
          </dl>
        </section>
      )}
      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="text-xl font-semibold">아이템 정보</h2>
        <ItemMetadata info={item} />
      </section>
      <ItemPriceHistory statistics={statistics} />
      <p className="border-t pt-4 text-xs leading-5 text-muted-foreground">
        데이터 출처: NEXON Open API. 날짜는 한국 시간 기준이며 일간 통계는 최근
        30일, 주간 통계는 최근 120일 범위를 조회합니다. 수집·집계 지연으로 게임
        내 정보와 차이가 있을 수 있습니다.
      </p>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </article>
  );
}
