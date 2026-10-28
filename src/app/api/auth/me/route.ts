import { NextRequest } from "next/server";

import { authErrorResponse, authResponse } from "@/lib/api/auth-response";
import { USER_ENDPOINT } from "@/lib/api/constants";
import { createAuthServerAxios } from "@/lib/api/server";

export async function GET(request: NextRequest) {
  try {
    const response = await createAuthServerAxios(request).get(
      `${USER_ENDPOINT}/info`,
    );
    return authResponse(response, true);
  } catch (error: unknown) {
    return authErrorResponse(error, "사용자 정보를 확인할 수 없습니다.");
  }
}
