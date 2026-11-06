import { Suspense } from "react";

import OutfitFeed from "@/components/page/outfits/OutfitFeed";
import { createPageMetadata } from "@/lib/seo/site";
export const metadata = createPageMetadata({
  title: "의장",
  description:
    "에린에서 만나는 나만의 스타일. 마비노기 의장 사진과 착용 아이템을 둘러보세요.",
  pathname: "/outfits",
});
export default function Page() {
  return (
    <Suspense
      fallback={<p className="py-12 text-center">의장을 불러오고 있어요.</p>}
    >
      <OutfitFeed />
    </Suspense>
  );
}
