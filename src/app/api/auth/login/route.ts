import { NextRequest, NextResponse } from "next/server";
import { createAuthServerAxios } from "@/lib/api/server";
import { AUTH_ENDPOINT } from "@/lib/api/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Auth Server로 로그인 요청
    // 로컬 게이트웨이(localhost:8099)를 통해 /das/**로 라우팅됩니다
    const serverAxios = createAuthServerAxios(request);
    const response = await serverAxios.post(`${AUTH_ENDPOINT}/login`, {
      email,
      password,
    });

    // Set-Cookie 헤더를 프론트엔드로 전달
    const cookies = response.headers["set-cookie"];
    const nextResponse = NextResponse.json(response.data);

    if (cookies) {
      // 배열로 온 쿠키들을 모두 설정
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
    console.error("로그인 API 에러:", error);

    // Axios 에러인 경우
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { status: number; data?: { message?: string } } };
      if (axiosError.response) {
        return NextResponse.json(
          {
            success: false,
            message: axiosError.response.data?.message || "로그인에 실패했습니다",
          },
          { status: axiosError.response.status }
        );
      }
    }

    // 일반 에러
    return NextResponse.json(
      {
        success: false,
        message: "서버 오류가 발생했습니다",
      },
      { status: 500 }
    );
  }
}
