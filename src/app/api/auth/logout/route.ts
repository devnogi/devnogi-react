import { NextRequest } from "next/server";
import { createAuthServerAxios } from "@/lib/api/server";
import { AUTH_ENDPOINT } from "@/lib/api/constants";
import { authErrorResponse, authResponse, clearAuthCookies } from "@/lib/api/auth-response";

export async function POST(request: NextRequest) {
  try {
    // 유효한 access 인증으로 서버의 refresh 폐기를 요청한다.
    const upstream = await createAuthServerAxios(request).post(`${AUTH_ENDPOINT}/logout`);
    const response = authResponse(upstream);
    return response.ok ? response : clearAuthCookies(response);
  } catch (error: unknown) {
    // 쿠키 제거와 서버 토큰 폐기는 다르다. upstream 실패 상태를 성공으로 바꾸지 않는다.
    return clearAuthCookies(authErrorResponse(error, "서버 로그아웃을 확인할 수 없습니다."));
  }
}
