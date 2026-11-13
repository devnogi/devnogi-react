import Link from "next/link";

import { getItemSeo, getPopularItems } from "@/lib/items/data";
import { encodeItemKey, itemPath } from "@/lib/items/identity";

export default async function AuctionMarketSummary() {
  try {
    const rankings = await getPopularItems();
    const items = await Promise.all(
      rankings.map(async (ranking) => {
        const identity = {
          name: ranking.itemName,
          topCategory: ranking.itemTopCategory,
          subCategory: ranking.itemSubCategory,
        };
        const catalog = await getItemSeo(encodeItemKey(identity));
        return { ranking, catalog };
      }),
    );
    return (
      <section
        className="my-6 space-y-3 rounded-xl border bg-card p-5"
        aria-labelledby="market-summary-heading"
      >
        <h2 id="market-summary-heading" className="text-lg font-semibold">
          오늘 많이 거래된 마비노기 아이템
        </h2>
        <p className="text-sm text-muted-foreground">
          아이템별 시세와 판매 수량을 확인하세요. 평균 가격은 수량을 반영한 가중
          평균입니다.
        </p>
        {items.length === 0 ? (
          <p>오늘 집계된 거래가 아직 없습니다.</p>
        ) : (
          <ul className="divide-y">
            {items.map(({ ranking, catalog }) => (
              <li
                key={`${ranking.itemTopCategory}/${ranking.itemSubCategory}/${ranking.itemName}`}
                className="flex flex-wrap justify-between gap-2 py-3"
              >
                {catalog ? (
                  <Link
                    className="font-medium text-primary underline-offset-4 hover:underline"
                    href={itemPath(catalog.item)}
                  >
                    {ranking.itemName}
                  </Link>
                ) : (
                  <span>{ranking.itemName}</span>
                )}
                <span className="text-sm text-muted-foreground">
                  {ranking.dateAuctionBuy} · 평균{" "}
                  {Math.round(
                    ranking.totalQuantity > 0
                      ? ranking.totalVolume / ranking.totalQuantity
                      : ranking.avgPrice,
                  ).toLocaleString("ko-KR")}{" "}
                  골드 · 판매 {ranking.totalQuantity.toLocaleString("ko-KR")}개
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  } catch {
    return (
      <section className="my-6 rounded-xl border p-5">
        <h2 className="font-semibold">인기 아이템 시세</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          시세 요약을 불러오지 못했습니다. 아래 검색에서 거래내역을 확인해
          주세요.
        </p>
      </section>
    );
  }
}
