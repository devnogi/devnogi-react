import { createAuthServerAxios } from "@/lib/api/server";
import { createLogger } from "@/lib/logger";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("API/comments/like");

// 댓글 좋아요 토글
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  logger.info(`POST /comments/like - 댓글 좋아요 토글 요청`);

  try {
    const body = await request.json();
    logger.debug(`Request body:`, body);

    const axios = createAuthServerAxios(request);

    // DCS API: POST /api/comments/like (댓글 좋아요 토글)
    const targetUrl = "/dcs/api/comments/like";
    logger.debug(`Forwarding to: ${targetUrl}`);

    const { data, status } = await axios.post(targetUrl, body);

    const duration = Date.now() - startTime;
    logger.info(`POST /comments/like - 성공 (${status}) [${duration}ms]`);
    logger.debug(`Response data:`, data);

    if (status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(data, { status });
  } catch (error: unknown) {
    const duration = Date.now() - startTime;

    if ((error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status ?? 500;
      const payload = axiosError.response?.data ?? {
        message: axiosError.message,
      };

      logger.error(`POST /comments/like - 실패 (${status}) [${duration}ms]`);
      logger.error(`Error details:`, {
        status,
        message: axiosError.message,
        code: axiosError.code,
        responseData: axiosError.response?.data,
      });

      return NextResponse.json(payload, { status });
    }

    const err = error instanceof Error ? error : new Error("Unknown error");
    logger.error(`POST /comments/like - 예외 발생 [${duration}ms]`, {
      message: err.message,
      stack: err.stack,
    });

    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
