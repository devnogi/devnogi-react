import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 쿠키 삭제
    const response = NextResponse.json({
      success: true,
      message: "로그아웃 성공",
    });

    // Access Token 쿠키 삭제
    response.cookies.set("access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    // Refresh Token 쿠키 삭제
    response.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("로그아웃 API 에러:", error);
    return NextResponse.json(
      {
        success: false,
        message: "로그아웃에 실패했습니다",
      },
      { status: 500 }
    );
  }
}
