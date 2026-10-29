import type { Metadata } from "next";

export const SITE_ORIGIN = new URL("https://www.memonogi.com");
export const SITE_NAME = "메모노기";
export const DEFAULT_DESCRIPTION =
  "마비노기 경매장 거래내역, 시세 정보, 아이템 정보와 커뮤니티를 제공하는 메모노기입니다.";

export const PUBLIC_SITEMAP_PATHS = [
  "/",
  "/auction-history",
  "/auction-realtime",
  "/community",
  "/horn-bugle",
  "/item-info",
  "/item-option-info",
  "/statistics",
] as const;

export function canonicalUrl(pathname = "/"): string {
  return new URL(pathname, SITE_ORIGIN).toString();
}

export function createPageMetadata({
  title,
  description,
  pathname,
  robots,
}: {
  title: string;
  description: string;
  pathname: string;
  robots?: Metadata["robots"];
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: SITE_NAME,
      title,
      description,
      url: pathname,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    robots,
  };
}
