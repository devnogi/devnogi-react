import { NextRequest } from "next/server";
import { createAuthServerAxios } from "@/lib/api/server";
import { AUTH_ENDPOINT } from "@/lib/api/constants";
import { authErrorResponse, authResponse } from "@/lib/api/auth-response";

export async function POST(request: NextRequest) {
  try {
    const response = await createAuthServerAxios(request, "refresh").post(`${AUTH_ENDPOINT}/refresh`);
    return authResponse(response, true);
  } catch (error: unknown) {
    return authErrorResponse(error, "로그인을 갱신할 수 없습니다.");
  }
}
