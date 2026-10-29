import type { MetadataRoute } from "next";

import { canonicalUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/mypage/",
        "/sign-in/",
        "/sign-up/",
        "/social-callback/",
        "/community/write/",
      ],
    },
    sitemap: canonicalUrl("/sitemap.xml"),
  };
}
