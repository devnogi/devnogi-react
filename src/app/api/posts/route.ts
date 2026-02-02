import { POSTS_ENDPOINT } from "@/lib/api/constants";
import { createAuthServerAxios, createServerAxios } from "@/lib/api/server";
import { GatewayConfigError } from "@/lib/api/gateway-selector";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

// posts 요청 캐싱 기간 5분(초)
export const revalidate = 300;

// 게시글 생성 (multipart/form-data)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const axios = createAuthServerAxios(request);
    // DCS API: POST /api/posts (게시글 생성)
    const { data, status } = await axios.post(POSTS_ENDPOINT, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return NextResponse.json(data, { status });
  } catch (error: unknown) {
    if (error instanceof GatewayConfigError) {
      console.error("[API POST /posts] GatewayConfigError:", error.message);
      return NextResponse.json(
        {
          success: false,
          code: "GATEWAY_CONFIG_ERROR",
          message: "서버 설정 오류가 발생했습니다. 관리자에게 문의하세요.",
        },
        { status: 503 }
      );
    }

    if ((error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status ?? 500;
      const payload = axiosError.response?.data ?? {
        success: false,
        message: axiosError.message,
      };
      return NextResponse.json(payload, { status });
    }

    const err = error instanceof Error ? error : new Error("Unknown error");
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ?? "0";
  const size = searchParams.get("size") ?? "20";

  try {
    const axios = createServerAxios(request);
    // DCS API: GET /api/posts (전체 게시판 게시글 조회)
    const { data, status } = await axios.get(POSTS_ENDPOINT, {
      params: {
        page,
        size,
      },
    });
    return NextResponse.json(data, { status: status });
  } catch (error: unknown) {
    // 게이트웨이 설정 오류 (환경변수 누락)
    if (error instanceof GatewayConfigError) {
      console.error("[API /posts] GatewayConfigError:", error.message);
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
      console.error("[API /posts] AxiosError:", {
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
    console.error("[API /posts] Error:", {
      message: err.message,
      stack: err.stack,
    });

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
