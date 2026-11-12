import { NextRequest } from "next/server";

import { proxyHero } from "@/lib/hero/proxy";
type Context = { params: Promise<{ segments?: string[] }> };
async function handle(request: NextRequest, context: Context) {
  const { segments = [] } = await context.params;
  return proxyHero(request, segments, "admin");
}
export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
