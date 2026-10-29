import { createPageMetadata } from "@/lib/seo/site";

export const metadata = createPageMetadata({
  title: "마비노기 거대한 뿔피리",
  description:
    "마비노기 거대한 뿔피리 메시지를 확인하고 필요한 정보를 찾아보세요.",
  pathname: "/horn-bugle",
});

export default function HornBugleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
