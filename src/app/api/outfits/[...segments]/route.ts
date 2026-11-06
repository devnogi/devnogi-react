import { NextRequest } from "next/server";

import { proxyOutfit } from "@/lib/outfits/proxy";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ segments: string[] }> };
async function handle(request: NextRequest, context: Context) {
  return proxyOutfit(request, (await context.params).segments);
}
export { handle as DELETE, handle as GET, handle as POST, handle as PUT };
