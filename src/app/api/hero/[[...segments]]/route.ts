import { NextRequest } from "next/server";

import { proxyHero } from "@/lib/hero/proxy";
type Context = { params: Promise<{ segments?: string[] }> };
async function handle(request: NextRequest, context: Context) {
  const { segments = [] } = await context.params;
  return proxyHero(request, segments, "public");
}
export const GET = handle;
