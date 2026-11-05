import { NextRequest } from "next/server";

import { proxyCommunityGet } from "@/lib/api/community-route";
interface Context {
  params: Promise<{ postId: string }>;
}
export async function GET(request: NextRequest, { params }: Context) {
  const { postId } = await params;
  return proxyCommunityGet(request, `/dcs/api/comments/${postId}/threads`);
}
