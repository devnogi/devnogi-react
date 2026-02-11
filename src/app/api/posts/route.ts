import { POSTS_ENDPOINT } from "@/lib/api/constants";
import { createAuthServerAxios, createServerAxios } from "@/lib/api/server";
import { GatewayConfigError } from "@/lib/api/gateway-selector";
import { createLogger } from "@/lib/logger";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("API/posts");

// posts 요청 캐싱 기간 5분(초)
export const dynamic = "force-dynamic";
export const revalidate = 300;

// 게시글 생성 (multipart/form-data)
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  logger.info(`POST /posts - 게시글 생성 요청`);

  try {
    const formData = await request.formData();

    // FormData 내용 로깅
    const formDataEntries: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (value instanceof File) {
        formDataEntries[key] = `[File: ${value.name}, ${value.size} bytes]`;
      } else {
        formDataEntries[key] = String(value);
      }
    });
    logger.debug(`FormData entries:`, formDataEntries);

    const axios = createAuthServerAxios(request);
    // DCS API: POST /api/posts (게시글 생성)
    logger.debug(`Forwarding to: ${POSTS_ENDPOINT}`);

    const { data, status } = await axios.post(POSTS_ENDPOINT, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const duration = Date.now() - startTime;
    logger.info(`POST /posts - 성공 (${status}) [${duration}ms]`);
    logger.debug(`Response data:`, data);

    return NextResponse.json(data, { status });
  } catch (error: unknown) {
    const duration = Date.now() - startTime;

    if (error instanceof GatewayConfigError) {
      logger.error(`POST /posts - GatewayConfigError [${duration}ms]`, {
        message: error.message,
      });
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

      logger.error(`POST /posts - 실패 (${status}) [${duration}ms]`);
      logger.error(`Error details:`, {
        status,
        message: axiosError.message,
        code: axiosError.code,
        responseData: axiosError.response?.data,
      });

      return NextResponse.json(payload, { status });
    }

    const err = error instanceof Error ? error : new Error("Unknown error");
    logger.error(`POST /posts - 예외 발생 [${duration}ms]`, {
      message: err.message,
      stack: err.stack,
    });

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

  const startTime = Date.now();
  logger.info(`GET /posts - 전체 게시글 조회`);
  logger.debug(`Query params: page=${page}, size=${size}`);

  try {
    const axios = createServerAxios(request);
    // DCS API: GET /api/posts (전체 게시판 게시글 조회)
    logger.debug(`Forwarding to: ${POSTS_ENDPOINT}`);

    const { data, status } = await axios.get(POSTS_ENDPOINT, {
      params: {
        page,
        size,
      },
    });

    const duration = Date.now() - startTime;
    logger.info(`GET /posts - 성공 (${status}) [${duration}ms]`);
    logger.debug(`Response data:`, data);

    return NextResponse.json(data, { status: status });
  } catch (error: unknown) {
    const duration = Date.now() - startTime;

    // 게이트웨이 설정 오류 (환경변수 누락)
    if (error instanceof GatewayConfigError) {
      logger.error(`GET /posts - GatewayConfigError [${duration}ms]`, {
        message: error.message,
      });
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

      logger.error(`GET /posts - 실패 (${status}) [${duration}ms]`);
      logger.error(`Error details:`, {
        status,
        message: axiosError.message,
        code: axiosError.code,
        url: axiosError.config?.url,
        responseData: axiosError.response?.data,
      });

      return NextResponse.json(payload, { status });
    }

    // 기타 오류
    const err = error instanceof Error ? error : new Error("Unknown error");
    logger.error(`GET /posts - 예외 발생 [${duration}ms]`, {
      message: err.message,
      stack: err.stack,
    });

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
