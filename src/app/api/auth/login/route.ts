import { NextRequest, NextResponse } from "next/server";
import { createServerAxios } from "@/lib/api/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Auth Server로 로그인 요청 (게이트웨이를 통해)
    const serverAxios = await createServerAxios(request);
    const response = await serverAxios.post("/das/api/auth/login", {
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
  } catch (error: any) {
    console.error("로그인 API 에러:", error);

    // Axios 에러인 경우
    if (error.response) {
      return NextResponse.json(
        {
          success: false,
          message: error.response.data?.message || "로그인에 실패했습니다",
        },
        { status: error.response.status }
      );
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
