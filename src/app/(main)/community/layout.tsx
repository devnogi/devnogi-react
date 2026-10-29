import { createPageMetadata } from "@/lib/seo/site";

export const metadata = createPageMetadata({
  title: "마비노기 커뮤니티",
  description:
    "마비노기 플레이 경험과 경매장 이용 정보를 나누는 메모노기 커뮤니티입니다.",
  pathname: "/community",
});

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
