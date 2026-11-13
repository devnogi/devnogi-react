import { sitemapResponse } from "@/lib/seo/sitemaps";

export const dynamic = "force-dynamic";
export function GET(request: Request) {
  return sitemapResponse("index", request);
}
