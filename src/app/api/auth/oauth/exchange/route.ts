import { NextRequest, NextResponse } from "next/server";

import { AUTH_ENDPOINT } from "@/lib/api/constants";
import { createPublicAuthServerAxios } from "@/lib/api/server";

const responseHeaders = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
};

function validExchangeResponse(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const response = value as { success?: unknown; data?: unknown };
  if (
    response.success !== true ||
    !response.data ||
    typeof response.data !== "object"
  )
    return false;
  const data = response.data as Record<string, unknown>;
  return (
    data.type === "LOGIN_SUCCESS" ||
    (data.type === "SIGNUP_REQUIRED" &&
      typeof data.provider === "string" &&
      typeof data.email === "string" &&
      typeof data.signupProof === "string" &&
      data.signupProof.length > 0)
  );
}

export async function POST(request: NextRequest) {
  let code: unknown;
  try {
    const body: unknown = await request.json();
    code =
      body && typeof body === "object"
        ? (body as { code?: unknown }).code
        : undefined;
  } catch {
    return NextResponse.json(
      { success: false, message: "소셜 인증 코드를 확인할 수 없습니다." },
      { status: 400, headers: responseHeaders },
    );
  }

  const binding = request.cookies.get("oauth_flow_binding")?.value;
  if (
    typeof code !== "string" ||
    code.length === 0 ||
    code.length > 512 ||
    !binding ||
    !/^[A-Za-z0-9_-]{43}$/.test(binding)
  ) {
    return NextResponse.json(
      { success: false, message: "소셜 인증을 다시 시작해주세요." },
      { status: 400, headers: responseHeaders },
    );
  }

  try {
    const serverAxios = createPublicAuthServerAxios();
    const upstream = await serverAxios.post(
      `${AUTH_ENDPOINT}/oauth/exchange`,
      { code },
      {
        headers: { Cookie: `oauth_flow_binding=${binding}` },
      },
    );
    if (!validExchangeResponse(upstream.data)) {
      return NextResponse.json(
        { success: false, message: "인증 서버의 응답을 확인할 수 없습니다." },
        { status: 502, headers: responseHeaders },
      );
    }
    const response = NextResponse.json(upstream.data, {
      status: upstream.status,
      headers: responseHeaders,
    });
    const cookies = upstream.headers["set-cookie"];
    for (const cookie of Array.isArray(cookies)
      ? cookies
      : cookies
        ? [cookies]
        : []) {
      response.headers.append("Set-Cookie", cookie);
    }
    return response;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const upstream = (error as { response?: { status?: number } }).response;
      if (upstream?.status && upstream.status >= 400 && upstream.status < 500) {
        return NextResponse.json(
          {
            success: false,
            code: "OAUTH_EXCHANGE_INVALID",
            message: "소셜 인증을 다시 시작해주세요.",
          },
          { status: upstream.status, headers: responseHeaders },
        );
      }
    }
    return NextResponse.json(
      { success: false, message: "소셜 인증에 실패했습니다." },
      { status: 502, headers: responseHeaders },
    );
  }
}
