import { NextRequest, NextResponse } from "next/server";
import { createPublicAuthServerAxios } from "@/lib/api/server";
import { AUTH_ENDPOINT } from "@/lib/api/constants";

export async function POST(request: NextRequest) {
  try {
    // FormData를 그대로 전달
    const formData = await request.formData();

    // Auth Server로 소셜 회원가입 요청
    const serverAxios = createPublicAuthServerAxios();
    const response = await serverAxios.post(`${AUTH_ENDPOINT}/signup/social`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const nextResponse = NextResponse.json(response.data);

    const cookies = response.headers["set-cookie"];
    if (cookies) {
      if (Array.isArray(cookies)) {
        cookies.forEach((cookie) => nextResponse.headers.append("Set-Cookie", cookie));
      } else {
        nextResponse.headers.set("Set-Cookie", cookies);
      }
    }

    return nextResponse;

  } catch (error: unknown) {
    console.error("소셜 회원가입 API 에러:", error);

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { status: number; data?: { message?: string } } };
      if (axiosError.response) {
        return NextResponse.json(
          {
            success: false,
            message: axiosError.response.data?.message || "소셜 회원가입에 실패했습니다",
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
