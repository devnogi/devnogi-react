import { NextRequest, NextResponse } from "next/server";
import { createPublicAuthServerAxios } from "@/lib/api/server";
import { AUTH_ENDPOINT } from "@/lib/api/constants";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "이메일을 입력해주세요",
        },
        { status: 400 }
      );
    }

    // Auth Server로 이메일 중복 체크 요청 (public API, 인증 불필요)
    // 로컬 게이트웨이(localhost:8099)를 통해 /das/**로 라우팅됩니다
    const serverAxios = createPublicAuthServerAxios();
    const response = await serverAxios.get(
      `${AUTH_ENDPOINT}/check-email?email=${encodeURIComponent(email)}`
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error("이메일 중복 체크 API 에러:", error);

    // 에러 응답 상세 로깅
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { status: number; data?: { message?: string }; headers?: unknown }; config?: { baseURL?: string; url?: string } };
      if (axiosError.response) {
        console.error("에러 상태:", axiosError.response.status);
        console.error("에러 데이터:", axiosError.response.data);
        console.error("에러 헤더:", axiosError.response.headers);
        console.error("요청 URL:", (axiosError.config?.baseURL || "") + (axiosError.config?.url || ""));

        return NextResponse.json(
          {
            success: false,
            message: axiosError.response.data?.message || "이메일 확인에 실패했습니다",
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
