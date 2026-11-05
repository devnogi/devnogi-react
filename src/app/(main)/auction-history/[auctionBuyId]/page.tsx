import type { Metadata } from "next";

import AuctionDetailView from "@/components/page/auction-common/AuctionDetailView";
import { getAuctionDetail, safeReturnTo } from "@/lib/auction/detail";

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
  return {
    title: {
      absolute: result.record
        ? `${result.record.itemName} 거래 내역 | 마비노기`
        : "경매장 거래 내역 | 마비노기",
    },
    robots:
      result.status === "available"
        ? undefined
        : { index: false, follow: false },
  };
}

export default async function AuctionHistoryDetailPage({
  params,
  searchParams,
}: PageProps) {
  const [{ auctionBuyId }, query] = await Promise.all([params, searchParams]);
  const result = await getAuctionDetail("history", auctionBuyId);
  return (
    <AuctionDetailView
      result={result}
      returnTo={safeReturnTo("history", query.return_to)}
    />
  );
}
