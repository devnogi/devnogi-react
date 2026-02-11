import { BOARDS_ENDPOINT } from "@/lib/api/constants";
import { createServerAxios } from "@/lib/api/server";
import { GatewayConfigError } from "@/lib/api/gateway-selector";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

// boards 요청 캐싱 기간 12시간 (매일 12시, 24시에 갱신)
export const dynamic = "force-dynamic";
export const revalidate = 43200; // 12시간 (초)

export async function GET(request: NextRequest) {
  try {
    const axios = createServerAxios(request);
    const { data, status } = await axios.get(BOARDS_ENDPOINT);
    return NextResponse.json(data, {
      status: status,
      headers: {
        "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=86400",
      },
    });
  } catch (error: unknown) {
    // 게이트웨이 설정 오류 (환경변수 누락)
    if (error instanceof GatewayConfigError) {
      console.error("[API /boards] GatewayConfigError:", error.message);
      return NextResponse.json(
        {
          success: false,
          code: "GATEWAY_CONFIG_ERROR",
          message: "서버 설정 오류가 발생했습니다. 관리자에게 문의하세요.",
        },
        { status: 503 }
      );
    }

    // AxiosError 처리(Gateway 통신 오류)
    if ((error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status ?? 500;
      const payload = axiosError.response?.data ?? {
        success: false,
        message: axiosError.message,
      };

      // Next.js 서버 로그에 에러 기록
      console.error("[API /boards] AxiosError:", {
        status,
        message: axiosError.message,
        url: axiosError.config?.url,
        responseData: axiosError.response?.data,
      });

      return NextResponse.json(payload, { status });
    }

    // 기타 오류
    const err = error instanceof Error ? error : new Error("Unknown error");

    // Next.js 서버 로그에 에러 기록
    console.error("[API /boards] Error:", {
      message: err.message,
      stack: err.stack,
    });

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
