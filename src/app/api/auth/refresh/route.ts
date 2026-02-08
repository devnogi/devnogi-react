import { NextRequest, NextResponse } from "next/server";
import { createAuthServerAxios } from "@/lib/api/server";
import { AUTH_ENDPOINT } from "@/lib/api/constants";

export async function POST(request: NextRequest) {
  try {
    // Auth Server로 refresh 요청
    // Cookie에 포함된 refresh_token이 자동으로 전달됨
    const serverAxios = createAuthServerAxios(request);
    const response = await serverAxios.post(`${AUTH_ENDPOINT}/refresh`);

    // Set-Cookie 헤더를 프론트엔드로 전달 (새 access_token + refresh_token)
    const cookies = response.headers["set-cookie"];
    const nextResponse = NextResponse.json(response.data);

    if (cookies) {
      if (Array.isArray(cookies)) {
        cookies.forEach((cookie) => {
          nextResponse.headers.append("Set-Cookie", cookie);
        });
      } else {
        nextResponse.headers.set("Set-Cookie", cookies);
      }
    }

    return nextResponse;
  } catch (error: unknown) {
    console.error("토큰 갱신 API 에러:", error);

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { status: number; data?: { message?: string } } };
      if (axiosError.response) {
        return NextResponse.json(
          {
            success: false,
            message: axiosError.response.data?.message || "토큰 갱신에 실패했습니다",
          },
          { status: axiosError.response.status }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "서버 오류가 발생했습니다",
      },
      { status: 500 }
    );
  }
}
