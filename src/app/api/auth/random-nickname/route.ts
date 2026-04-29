import { AUTH_ENDPOINT } from "@/lib/api/constants";
import { createPublicAuthServerAxios } from "@/lib/api/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const serverAxios = createPublicAuthServerAxios();
    const response = await serverAxios.get(`${AUTH_ENDPOINT}/random-nickname`);

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error("랜덤 닉네임 조회 API 에러:", error);

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { status: number; data?: { message?: string } };
      };

      if (axiosError.response) {
        return NextResponse.json(
          {
            success: false,
            message:
              axiosError.response.data?.message ||
              "랜덤 닉네임 조회에 실패했습니다",
          },
          { status: axiosError.response.status },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "서버 오류가 발생했습니다",
      },
      { status: 500 },
    );
  }
}
