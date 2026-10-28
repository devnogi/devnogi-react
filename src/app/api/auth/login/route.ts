import { NextRequest, NextResponse } from "next/server";

import { authErrorResponse, authResponse } from "@/lib/api/auth-response";
import { AUTH_ENDPOINT } from "@/lib/api/constants";
import { createAuthServerAxios } from "@/lib/api/server";

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "잘못된 로그인 요청입니다." },
      { status: 400 },
    );
  }
  if (
    !body ||
    typeof body.email !== "string" ||
    typeof body.password !== "string"
  ) {
    return NextResponse.json(
      { success: false, message: "이메일과 비밀번호를 입력해주세요." },
      { status: 400 },
    );
  }
  try {
    const response = await createAuthServerAxios(request, "none").post(
      `${AUTH_ENDPOINT}/login`,
      {
        email: body.email,
        password: body.password,
      },
    );
    return authResponse(response, true);
  } catch (error: unknown) {
    return authErrorResponse(
      error,
      "로그인에 실패했습니다. 다시 시도해주세요.",
    );
  }
}
