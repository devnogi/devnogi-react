import type { Metadata } from "next";

import HomeLanding from "@/components/seo/HomeLanding";
import { createPageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = createPageMetadata({
  title: "마비노기 경매장·시세·아이템 정보",
  description:
    "마비노기 경매장 거래내역, 시세 정보, 아이템 정보와 커뮤니티를 제공하는 메모노기입니다.",
  pathname: "/",
});

export default function HomePage() {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "메모노기",
    url: "https://www.memonogi.com",
    description:
      "마비노기 경매장 거래내역, 시세 정보, 아이템 정보와 커뮤니티를 제공하는 메모노기입니다.",
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "메모노기",
    url: "https://www.memonogi.com",
  };

  return (
    <>
      <HomeLanding />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
    </>
  );
}
