import { NextRequest } from "next/server";

import { proxyCommunityMutation } from "@/lib/api/community-route";
interface Context {
  params: Promise<{ id: string }>;
}
export async function PUT(request: NextRequest, { params }: Context) {
  const { id } = await params;
  return proxyCommunityMutation(request, `/dcs/api/posts/${id}/bookmark`);
}
export async function DELETE(request: NextRequest, { params }: Context) {
  const { id } = await params;
  return proxyCommunityMutation(request, `/dcs/api/posts/${id}/bookmark`);
}
