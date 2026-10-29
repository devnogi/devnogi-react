import { createPageMetadata } from "@/lib/seo/site";

export const metadata = createPageMetadata({
  title: "마비노기 아이템 정보",
  description:
    "마비노기 아이템의 분류와 상세 정보를 검색하고 필요한 아이템을 찾아보세요.",
  pathname: "/item-info",
});

export default function ItemInfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
