import { isAxiosError, type AxiosResponse } from "axios";
import { NextResponse } from "next/server";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Auth CommonResponse만 성공으로 전달한다. OAuth HTML/redirect는 사용자 JSON이 아니다. */
export function authResponse(response: AxiosResponse, requiresUser = false): NextResponse {
  const data: unknown = response.data;
  if (
    response.status < 200 || response.status >= 300 ||
    !isObject(data) || data.success !== true || !("data" in data) ||
    (requiresUser && (!isObject(data.data) ||
      typeof data.data.userId !== "number" || typeof data.data.email !== "string" ||
      typeof data.data.nickname !== "string"))
  ) {
    return NextResponse.json(
      { success: false, message: "인증 서버의 응답을 확인할 수 없습니다." },
      { status: 502 }
    );
  }

  const result = NextResponse.json(data, { status: response.status });
  const cookies = response.headers["set-cookie"];
  for (const cookie of Array.isArray(cookies) ? cookies : cookies ? [cookies] : []) {
    result.headers.append("Set-Cookie", cookie);
  }
  return result;
}

export function authErrorResponse(error: unknown, message: string): NextResponse {
  if (isAxiosError(error) && error.response) {
    const { status, data } = error.response;
    if (status >= 400 && status <= 599) {
      return NextResponse.json(
        isObject(data) && data.success === false && typeof data.message === "string"
          ? data : { success: false, message },
        { status }
      );
    }
  }
  // 원본 오류에는 비밀번호가 든 config.data와 인증 헤더가 포함될 수 있다.
  return NextResponse.json({ success: false, message }, { status: 502 });
}

/** upstream에 도달하지 못한 경우에도 브라우저 쿠키만 동일 scope에서 제거한다. */
export function clearAuthCookies(response: NextResponse): NextResponse {
  const sameSite = (process.env.JWT_COOKIE_SAME_SITE ?? "None").toLowerCase();
  const options = {
    httpOnly: true,
    secure: process.env.JWT_COOKIE_SECURE !== "false",
    sameSite: sameSite === "lax" ? "lax" as const : sameSite === "strict" ? "strict" as const : "none" as const,
    maxAge: 0,
    path: "/",
    domain: (process.env.JWT_COOKIE_DOMAIN ?? ".memonogi.com") || undefined,
  };
  response.cookies.set("access_token", "", options);
  response.cookies.set("refresh_token", "", options);
  return response;
}
