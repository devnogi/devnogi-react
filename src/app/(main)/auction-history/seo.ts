import type { Metadata } from "next";

import { canonicalUrl } from "@/lib/seo/site";

const AUCTION_HISTORY_PATH = "/auction-history";

export type AuctionSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function hasValue(value: string | string[] | undefined): boolean {
  return firstValue(value)?.trim().length !== 0;
}

function normalizedSearchIntent(searchParams: AuctionSearchParams) {
  const itemName =
    firstValue(searchParams.item_name) ??
    firstValue(searchParams.itemName) ??
    firstValue(searchParams.name);
  const topCategory =
    firstValue(searchParams.top_category) ??
    firstValue(searchParams.itemTopCategory) ??
    firstValue(searchParams.topCategory);
  const subCategory =
    firstValue(searchParams.sub_category) ??
    firstValue(searchParams.itemSubCategory) ??
    firstValue(searchParams.subCategory);

  return { itemName, topCategory, subCategory };
}

export function getAuctionSearchMetadata(
  searchParams: AuctionSearchParams,
): Metadata {
  const { itemName, topCategory, subCategory } =
    normalizedSearchIntent(searchParams);
  const allowedKeys = new Set([
    "item_name",
    "itemName",
    "name",
    "top_category",
    "itemTopCategory",
    "topCategory",
    "sub_category",
    "itemSubCategory",
    "subCategory",
  ]);
  const hasNonCanonicalVariant = Object.entries(searchParams).some(
    ([key, value]) => !allowedKeys.has(key) && hasValue(value),
  );
  const canonicalParams = new URLSearchParams();

  if (!hasNonCanonicalVariant) {
    if (itemName?.trim()) canonicalParams.set("item_name", itemName.trim());
    if (topCategory?.trim())
      canonicalParams.set("top_category", topCategory.trim());
    if (subCategory?.trim())
      canonicalParams.set("sub_category", subCategory.trim());
  }

  const canonicalPath = canonicalParams.size
    ? `${AUCTION_HISTORY_PATH}?${canonicalParams.toString()}`
    : AUCTION_HISTORY_PATH;
  const subject =
    itemName?.trim() || subCategory?.trim() || topCategory?.trim();
  const title = subject
    ? `${subject} 거래내역·시세 검색`
    : "마비노기 경매장 거래내역·아이템 시세 검색";

  return {
    title,
    description:
      "마비노기 경매장 거래내역을 아이템명과 카테고리로 찾아보고, 검색 조건에 따라 거래 정보를 확인하세요.",
    alternates: { canonical: canonicalUrl(canonicalPath) },
    robots: hasNonCanonicalVariant
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title,
      description:
        "마비노기 경매장 거래내역과 아이템 시세를 검색하는 메모노기 기능입니다.",
      url: canonicalPath,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description:
        "마비노기 경매장 거래내역과 아이템 시세를 검색하는 메모노기 기능입니다.",
    },
  };
}
