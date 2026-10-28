import { NextRequest, NextResponse } from "next/server";

import {
  authErrorResponse,
  authResponse,
  clearAuthCookies,
} from "@/lib/api/auth-response";
import { AUTH_ENDPOINT } from "@/lib/api/constants";
import { createAuthServerAxios } from "@/lib/api/server";

export async function POST(request: NextRequest) {
  // auth는 access 쿠키로 principal을 확인한다. 쿠키 존재만으로 유효성을 보장하지 않는다.
  if (!request.cookies.get("access_token")?.value.trim()) {
    return clearAuthCookies(
      NextResponse.json(
        {
          success: false,
          message:
            "서버 로그아웃을 확인할 수 없습니다. 인증 쿠키가 필요합니다.",
        },
        { status: 401 },
      ),
    );
  }
  try {
    // 쿠키의 실제 유효성과 principal은 gateway/auth가 검증한다.
    const upstream = await createAuthServerAxios(request).post(
      `${AUTH_ENDPOINT}/logout`,
    );
    const response = authResponse(upstream);
    return response.ok ? response : clearAuthCookies(response);
  } catch (error: unknown) {
    // 쿠키 제거와 서버 토큰 폐기는 다르다. upstream 실패 상태를 성공으로 바꾸지 않는다.
    return clearAuthCookies(
      authErrorResponse(error, "서버 로그아웃을 확인할 수 없습니다."),
    );
  }
}
