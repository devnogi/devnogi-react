import { NextRequest, NextResponse } from "next/server";

import { authErrorResponse, authResponse } from "@/lib/api/auth-response";
import { USER_ENDPOINT } from "@/lib/api/constants";
import { createAuthServerAxios } from "@/lib/api/server";

export async function GET(request: NextRequest) {
  const cursor = request.nextUrl.searchParams.get("cursor");
  const size = request.nextUrl.searchParams.get("size") ?? "20";
  if (
    (cursor !== null && !/^[1-9]\d*$/.test(cursor)) ||
    !/^[1-9]\d*$/.test(size) ||
    Number(size) > 100
  ) {
    return NextResponse.json(
      { success: false, message: "올바른 이력 조회 범위를 지정해주세요." },
      { status: 400 },
    );
  }
  try {
    const response = authResponse(
      await createAuthServerAxios(request).get(
        `${USER_ENDPOINT}/experience/history`,
        {
          params: { ...(cursor === null ? {} : { cursor }), size },
        },
      ),
    );
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error: unknown) {
    return authErrorResponse(error, "경험치 이력을 불러올 수 없습니다.");
  }
}
