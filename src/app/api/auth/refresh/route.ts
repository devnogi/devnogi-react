import { NextRequest } from "next/server";

import { authErrorResponse, authResponse } from "@/lib/api/auth-response";
import { AUTH_ENDPOINT } from "@/lib/api/constants";
import { createAuthServerAxios } from "@/lib/api/server";

export async function POST(request: NextRequest) {
  try {
    const response = await createAuthServerAxios(request, "refresh").post(
      `${AUTH_ENDPOINT}/refresh`,
    );
    return authResponse(response, true);
  } catch (error: unknown) {
    return authErrorResponse(error, "로그인을 갱신할 수 없습니다.");
  }
}
