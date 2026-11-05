import type { Metadata } from "next";

import AuctionDetailView from "@/components/page/auction-common/AuctionDetailView";
import { getAuctionDetail, safeReturnTo } from "@/lib/auction/detail";

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
  return {
    title: {
      absolute: result.record
        ? `${result.record.itemName} 실시간 거래 | 마비노기`
        : "경매장 실시간 거래 | 마비노기",
    },
    robots:
      result.status === "available"
        ? undefined
        : { index: false, follow: false },
  };
}

export default async function AuctionRealtimeDetailPage({
  params,
  searchParams,
}: PageProps) {
  const [{ auctionId }, query] = await Promise.all([params, searchParams]);
  const result = await getAuctionDetail("realtime", auctionId);
  return (
    <AuctionDetailView
      result={result}
      returnTo={safeReturnTo("realtime", query.return_to)}
    />
  );
}
