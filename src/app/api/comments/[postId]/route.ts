import { createAuthServerAxios, createServerAxios } from "@/lib/api/server";
import { createLogger } from "@/lib/logger";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("API/comments");

// comments 요청 캐싱 기간 1분(초)
export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ?? "1";
  const size = searchParams.get("size") ?? "20";
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const direction = searchParams.get("direction") ?? "desc";

  const startTime = Date.now();
  logger.info(`GET /comments/${postId} - 댓글 목록 조회`);
  logger.debug(`Query params: page=${page}, size=${size}, sortBy=${sortBy}, direction=${direction}`);

  try {
    const axios = createServerAxios(request);
    // DCS API: GET /api/comments/{postId} (게시글별 댓글 조회)
    const targetUrl = `/dcs/api/comments/${postId}`;
    logger.debug(`Forwarding to: ${targetUrl}`);

    const { data, status } = await axios.get(targetUrl, {
      params: {
        page,
        size,
        sortBy,
        direction,
      },
    });

    const duration = Date.now() - startTime;
    logger.info(`GET /comments/${postId} - 성공 (${status}) [${duration}ms]`);
    logger.debug(`Response data:`, data);

    return NextResponse.json(data, { status: status });
  } catch (error: unknown) {
    const duration = Date.now() - startTime;

    // AxiosError 처리(Gateway 통신 오류)
    if ((error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status ?? 500;
      const payload = axiosError.response?.data ?? {
        message: axiosError.message,
      };

      logger.error(`GET /comments/${postId} - 실패 (${status}) [${duration}ms]`);
      logger.error(`Error details:`, {
        status,
        message: axiosError.message,
        code: axiosError.code,
        responseData: axiosError.response?.data,
      });

      return NextResponse.json(payload, { status });
    }

    // 기타 오류
    const err = error instanceof Error ? error : new Error("Unknown error");
    logger.error(`GET /comments/${postId} - 예외 발생 [${duration}ms]`, {
      message: err.message,
      stack: err.stack,
    });

    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// 댓글 작성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const startTime = Date.now();

  logger.info(`POST /comments/${postId} - 댓글 작성 요청`);

  // 디버깅: 쿠키 확인
  const cookieHeader = request.headers.get("cookie");
  logger.debug(`Cookie header present: ${!!cookieHeader}`);
  if (cookieHeader) {
    const hasAccessToken = cookieHeader.includes("access_token=");
    logger.debug(`Has access_token cookie: ${hasAccessToken}`);
  }

  try {
    const body = await request.json();
    logger.debug(`Request body:`, body);

    const axios = createAuthServerAxios(request);

    // 디버깅: axios 헤더 확인
    logger.debug(`Axios default headers:`, {
      Authorization: axios.defaults.headers.Authorization
        ? "(present)"
        : "(missing)",
      ContentType: axios.defaults.headers["Content-Type"],
    });

    // DCS API: POST /api/comments/{postId} (댓글 작성)
    const targetUrl = `/dcs/api/comments/${postId}`;
    logger.debug(`Forwarding to: ${targetUrl}`);

    const { data, status } = await axios.post(targetUrl, body);

    const duration = Date.now() - startTime;
    logger.info(`POST /comments/${postId} - 성공 (${status}) [${duration}ms]`);
    logger.debug(`Response data:`, data);

    return NextResponse.json(data, { status });
  } catch (error: unknown) {
    const duration = Date.now() - startTime;

    if ((error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status ?? 500;
      const payload = axiosError.response?.data ?? {
        message: axiosError.message,
      };

      logger.error(`POST /comments/${postId} - 실패 (${status}) [${duration}ms]`);
      logger.error(`Error details:`, {
        status,
        message: axiosError.message,
        code: axiosError.code,
        responseData: axiosError.response?.data,
      });

      return NextResponse.json(payload, { status });
    }

    const err = error instanceof Error ? error : new Error("Unknown error");
    logger.error(`POST /comments/${postId} - 예외 발생 [${duration}ms]`, {
      message: err.message,
      stack: err.stack,
    });

    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
