import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AuctionDetailView from "@/components/page/auction-common/AuctionDetailView";
import { getAuctionDetail, safeReturnTo } from "@/lib/auction/detail";
import { canonicalUrl } from "@/lib/seo/site";

interface PageProps {
  params: Promise<{ auctionBuyId: string }>;
  searchParams: Promise<{ return_to?: string | string[] }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { auctionBuyId } = await params;
  const result = await getAuctionDetail("history", auctionBuyId);
  if (result.status === "not-found") notFound();
  if (result.status === "error" || !result.record)
    throw new Error("경매장 상세 정보를 불러오지 못했습니다.");
  return {
    title: {
      absolute: result.record
        ? `${result.record.itemName} 거래 내역 | 마비노기`
        : "경매장 거래 내역 | 마비노기",
    },
    description: `${result.record.itemName}의 마비노기 경매장 거래 내역과 아이템 시세를 확인하세요.`,
    alternates: {
      canonical: canonicalUrl(
        `/auction-history/${encodeURIComponent(auctionBuyId)}`,
      ),
    },
    openGraph: {
      url: canonicalUrl(`/auction-history/${encodeURIComponent(auctionBuyId)}`),
    },
  };
}

export default async function AuctionHistoryDetailPage({
  params,
  searchParams,
}: PageProps) {
  const [{ auctionBuyId }, query] = await Promise.all([params, searchParams]);
  const result = await getAuctionDetail("history", auctionBuyId);
  if (result.status === "not-found") notFound();
  if (result.status === "error" || !result.record)
    throw new Error("경매장 상세 정보를 불러오지 못했습니다.");
  return (
    <AuctionDetailView
      result={result}
      returnTo={safeReturnTo("history", query.return_to)}
    />
  );
}
