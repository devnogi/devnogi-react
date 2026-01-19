import { USER_ENDPOINT } from "@/lib/api/constants";
import { createAuthServerAxios } from "@/lib/api/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const serverAxios = createAuthServerAxios(request);
    const response = await serverAxios.get(`${USER_ENDPOINT}/info`);

    return NextResponse.json(response.data);

    /*
    // 쿠키에서 access_token 확인
    const accessToken = request.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: "인증되지 않은 사용자입니다",
        },
        { status: 401 }
      );
    }

    // TODO: JWT 토큰을 파싱하여 사용자 정보 추출
    // 또는 Auth Server의 /me 엔드포인트 호출
    // 현재는 임시로 토큰만 검증

    // 임시: JWT 디코딩 (실제로는 서버에서 검증해야 함)
    try {
      const payload = JSON.parse(
        Buffer.from(accessToken.split(".")[1], "base64").toString()
      );

      return NextResponse.json({
        success: true,
        data: {
          email: payload.sub,
          nickname: payload.nickname || "사용자",
          profileImageUrl: null,
        },
      });
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "유효하지 않은 토큰입니다",
        },
        { status: 401 }
      );
    }
    */
  } catch (error) {
    console.error("사용자 정보 조회 API 에러:", error);
    return NextResponse.json(
      {
        success: false,
        message: "서버 오류가 발생했습니다",
      },
      { status: 500 }
    );
  }
}
