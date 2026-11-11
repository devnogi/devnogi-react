import { NextRequest } from "next/server";

import { authErrorResponse, authResponse } from "@/lib/api/auth-response";
import { USER_ENDPOINT } from "@/lib/api/constants";
import { createAuthServerAxios } from "@/lib/api/server";

export async function GET(request: NextRequest) {
  try {
    const response = authResponse(
      await createAuthServerAxios(request).get(`${USER_ENDPOINT}/experience`),
    );
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error: unknown) {
    return authErrorResponse(error, "경험치를 불러올 수 없습니다.");
  }
}
