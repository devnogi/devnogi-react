import { NextRequest } from "next/server";

import { proxyOutfit } from "@/lib/outfits/proxy";
export const dynamic = "force-dynamic";
export function GET(request: NextRequest) {
  return proxyOutfit(request);
}
export function POST(request: NextRequest) {
  return proxyOutfit(request);
}
