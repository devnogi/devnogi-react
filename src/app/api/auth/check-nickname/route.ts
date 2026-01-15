import { NextRequest, NextResponse } from "next/server";
import { createPublicAuthServerAxios } from "@/lib/api/server";
import { AUTH_ENDPOINT } from "@/lib/api/constants";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const nickname = searchParams.get("nickname");

    if (!nickname) {
      return NextResponse.json(
        {
          success: false,
          message: "닉네임을 입력해주세요",
        },
        { status: 400 }
      );
    }

    // Auth Server로 닉네임 중복 체크 요청 (public API, 인증 불필요)
    // 로컬 게이트웨이(localhost:8099)를 통해 /das/**로 라우팅됩니다
    const serverAxios = createPublicAuthServerAxios();
    const response = await serverAxios.get(
      `${AUTH_ENDPOINT}/check-nickname?nickname=${encodeURIComponent(nickname)}`
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error("닉네임 중복 체크 API 에러:", error);

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { status: number; data?: { message?: string } } };
      if (axiosError.response) {
        return NextResponse.json(
          {
            success: false,
            message: axiosError.response.data?.message || "닉네임 확인에 실패했습니다",
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
