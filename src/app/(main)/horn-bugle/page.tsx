import { createPageMetadata } from "@/lib/seo/site";

import HornBugleClient from "./HornBugleClient";

export const metadata = createPageMetadata({
  title: "마비노기 거대한 뿔피리",
  description:
    "마비노기 거대한 뿔피리 메시지를 확인하고 필요한 정보를 찾아보세요.",
  pathname: "/horn-bugle",
});

export const dynamic = "force-dynamic";

export default function HornBuglePage() {
  return <HornBugleClient />;
}
