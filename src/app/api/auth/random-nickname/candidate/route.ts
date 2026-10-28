import { NextResponse } from "next/server";

import { AUTH_ENDPOINT } from "@/lib/api/constants";
import { createPublicAuthServerAxios } from "@/lib/api/server";

const noStore = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    const serverAxios = createPublicAuthServerAxios();
    const response = await serverAxios.get(
      `${AUTH_ENDPOINT}/random-nickname/candidate`,
    );
    return NextResponse.json(response.data, { headers: noStore });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: {
          status: number;
          data?: { message?: string; code?: string };
        };
      };
      if (axiosError.response) {
        return NextResponse.json(
          {
            success: false,
            code: axiosError.response.data?.code,
            message:
              axiosError.response.data?.message || "닉네임 발급에 실패했습니다",
          },
          { status: axiosError.response.status, headers: noStore },
        );
      }
    }
    return NextResponse.json(
      { success: false, message: "닉네임 발급에 실패했습니다" },
      { status: 502, headers: noStore },
    );
  }
}
