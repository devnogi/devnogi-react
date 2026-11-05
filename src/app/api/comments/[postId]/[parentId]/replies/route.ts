import { NextRequest } from "next/server";

import { proxyCommunityGet } from "@/lib/api/community-route";
interface Context {
  params: Promise<{ postId: string; parentId: string }>;
}
export async function GET(request: NextRequest, { params }: Context) {
  const { postId, parentId } = await params;
  return proxyCommunityGet(
    request,
    `/dcs/api/comments/${postId}/${parentId}/replies`,
  );
}
