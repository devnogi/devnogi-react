import { NextRequest, NextResponse } from "next/server";
import { createPublicAuthServerAxios } from "@/lib/api/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Auth Server로 회원가입 요청 (public API, 인증 불필요)
    // 로컬 게이트웨이(localhost:8099)를 통해 /das/**로 라우팅됩니다
    // multipart/form-data로 전송
    const serverAxios = createPublicAuthServerAxios();
    const response = await serverAxios.post("/das/api/auth/signup", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("회원가입 API 에러:", error);

    // Axios 에러인 경우
    if (error.response) {
      return NextResponse.json(
        {
          success: false,
          message: error.response.data?.message || "회원가입에 실패했습니다",
          code: error.response.data?.code || "SIGNUP_FAILED",
        },
        { status: error.response.status }
      );
    }

    // 일반 에러
    return NextResponse.json(
      {
        success: false,
        message: "서버 오류가 발생했습니다",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
