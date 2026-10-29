import { createPageMetadata } from "@/lib/seo/site";

import StatisticsClient from "./StatisticsClient";

export const metadata = createPageMetadata({
  title: "마비노기 경매장 시세 통계",
  description:
    "마비노기 경매장 거래량과 가격 흐름을 통계로 확인해 아이템 시세를 살펴보세요.",
  pathname: "/statistics",
});

export const dynamic = "force-dynamic";

export default function StatisticsPage() {
  return <StatisticsClient />;
}
