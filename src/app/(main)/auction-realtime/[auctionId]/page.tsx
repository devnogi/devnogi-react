import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AuctionDetailView from "@/components/page/auction-common/AuctionDetailView";
import { getAuctionDetail, safeReturnTo } from "@/lib/auction/detail";
import { canonicalUrl } from "@/lib/seo/site";

interface PageProps {
  params: Promise<{ auctionId: string }>;
  searchParams: Promise<{ return_to?: string | string[] }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { auctionId } = await params;
  const result = await getAuctionDetail("realtime", auctionId);
  if (result.status === "not-found") notFound();
  if (result.status === "error" || !result.record)
    throw new Error("경매장 상세 정보를 불러오지 못했습니다.");
  return {
    title: {
      absolute: result.record
        ? `${result.record.itemName} 실시간 거래 | 마비노기`
        : "경매장 실시간 거래 | 마비노기",
    },
    description: `${result.record.itemName}의 마비노기 경매장 실시간 거래과 아이템 시세를 확인하세요.`,
    alternates: {
      canonical: canonicalUrl(
        `/auction-realtime/${encodeURIComponent(auctionId)}`,
      ),
    },
    openGraph: {
      url: canonicalUrl(`/auction-realtime/${encodeURIComponent(auctionId)}`),
    },
  };
}

export default async function AuctionRealtimeDetailPage({
  params,
  searchParams,
}: PageProps) {
  const [{ auctionId }, query] = await Promise.all([params, searchParams]);
  const result = await getAuctionDetail("realtime", auctionId);
  if (result.status === "not-found") notFound();
  if (result.status === "error" || !result.record)
    throw new Error("경매장 상세 정보를 불러오지 못했습니다.");
  return (
    <AuctionDetailView
      result={result}
      returnTo={safeReturnTo("realtime", query.return_to)}
    />
  );
}
