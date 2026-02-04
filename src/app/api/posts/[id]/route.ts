import { createAuthServerAxios, createServerAxios } from "@/lib/api/server";
import { createLogger } from "@/lib/logger";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("API/posts/[id]");

// posts 요청 캐싱 기간 5분(초)
export const revalidate = 300;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ?? "1";
  const size = searchParams.get("size") ?? "20";

  const startTime = Date.now();
  logger.info(`GET /posts/${id} - 게시판별 게시글 조회`);
  logger.debug(`Query params: page=${page}, size=${size}`);

  try {
    const axios = createServerAxios(request);
    // DCS API: GET /api/posts/{boardId} (게시판별 게시글 조회)
    const targetUrl = `/dcs/api/posts/${id}`;
    logger.debug(`Forwarding to: ${targetUrl}`);

    const { data, status } = await axios.get(targetUrl, {
      params: {
        page,
        size,
      },
    });

    const duration = Date.now() - startTime;
    logger.info(`GET /posts/${id} - 성공 (${status}) [${duration}ms]`);
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

      logger.error(`GET /posts/${id} - 실패 (${status}) [${duration}ms]`);
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
    logger.error(`GET /posts/${id} - 예외 발생 [${duration}ms]`, {
      message: err.message,
      stack: err.stack,
    });

    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// 게시글 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const startTime = Date.now();

  logger.info(`PATCH /posts/${id} - 게시글 수정 요청`);

  try {
    const body = await request.json();
    logger.debug(`Request body:`, body);

    const axios = createAuthServerAxios(request);
    // DCS API: PATCH /api/posts/{id} (게시글 수정)
    const targetUrl = `/dcs/api/posts/${id}`;
    logger.debug(`Forwarding to: ${targetUrl}`);

    const { data, status } = await axios.patch(targetUrl, body);

    const duration = Date.now() - startTime;
    logger.info(`PATCH /posts/${id} - 성공 (${status}) [${duration}ms]`);
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

      logger.error(`PATCH /posts/${id} - 실패 (${status}) [${duration}ms]`);
      logger.error(`Error details:`, {
        status,
        message: axiosError.message,
        code: axiosError.code,
        responseData: axiosError.response?.data,
      });

      return NextResponse.json(payload, { status });
    }

    const err = error instanceof Error ? error : new Error("Unknown error");
    logger.error(`PATCH /posts/${id} - 예외 발생 [${duration}ms]`, {
      message: err.message,
      stack: err.stack,
    });

    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// 게시글 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const startTime = Date.now();

  logger.info(`DELETE /posts/${id} - 게시글 삭제 요청`);

  try {
    const axios = createAuthServerAxios(request);
    // DCS API: DELETE /api/posts/{id} (게시글 삭제)
    const targetUrl = `/dcs/api/posts/${id}`;
    logger.debug(`Forwarding to: ${targetUrl}`);

    const { data, status } = await axios.delete(targetUrl);

    const duration = Date.now() - startTime;
    logger.info(`DELETE /posts/${id} - 성공 (${status}) [${duration}ms]`);
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

      logger.error(`DELETE /posts/${id} - 실패 (${status}) [${duration}ms]`);
      logger.error(`Error details:`, {
        status,
        message: axiosError.message,
        code: axiosError.code,
        responseData: axiosError.response?.data,
      });

      return NextResponse.json(payload, { status });
    }

    const err = error instanceof Error ? error : new Error("Unknown error");
    logger.error(`DELETE /posts/${id} - 예외 발생 [${duration}ms]`, {
      message: err.message,
      stack: err.stack,
    });

    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
