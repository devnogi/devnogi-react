import type { MetadataRoute } from "next";

import { canonicalUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api",
        "/api/",
        "/admin",
        "/admin/",
        "/mypage",
        "/mypage/",
        "/sign-in",
        "/sign-in/",
        "/sign-up",
        "/sign-up/",
        "/social-callback",
        "/social-callback/",
        "/community/write",
        "/community/write/",
      ],
    },
    sitemap: canonicalUrl("/sitemap.xml"),
  };
}
