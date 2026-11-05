import { NextRequest } from "next/server";

import { proxyCommunityGet } from "@/lib/api/community-route";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  return proxyCommunityGet(request, "/dcs/api/posts/feed");
}
