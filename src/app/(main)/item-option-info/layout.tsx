import { createPageMetadata } from "@/lib/seo/site";

export const metadata = createPageMetadata({
  title: "마비노기 아이템 옵션 정보",
  description:
    "마비노기 장비와 아이템 옵션 정보를 확인하고 옵션 조건을 비교해 보세요.",
  pathname: "/item-option-info",
});

export default function ItemOptionInfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
