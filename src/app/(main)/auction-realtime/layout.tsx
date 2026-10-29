import { createPageMetadata } from "@/lib/seo/site";

export const metadata = createPageMetadata({
  title: "마비노기 경매장 실시간 매물",
  description:
    "마비노기 경매장에 등록된 실시간 매물을 조건과 카테고리로 찾아보세요.",
  pathname: "/auction-realtime",
});

export default function AuctionRealtimeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
