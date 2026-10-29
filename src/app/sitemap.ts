import type { MetadataRoute } from "next";

import { canonicalUrl, PUBLIC_SITEMAP_PATHS } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_SITEMAP_PATHS.map((pathname) => ({
    url: canonicalUrl(pathname),
  }));
}
