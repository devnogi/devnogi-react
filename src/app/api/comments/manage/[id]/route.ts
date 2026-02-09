import { createAuthServerAxios } from "@/lib/api/server";
import { createLogger } from "@/lib/logger";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("API/comments/manage");

// 댓글 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const startTime = Date.now();

  logger.info(`PATCH /comments/manage/${id} - 댓글 수정 요청`);

  try {
    const body = await request.json();
    logger.debug(`Request body:`, body);

    const axios = createAuthServerAxios(request);
    // DCS API: PATCH /api/comments/{id} (댓글 수정)
    const targetUrl = `/dcs/api/comments/${id}`;
    logger.debug(`Forwarding to: ${targetUrl}`);

    const { data, status } = await axios.patch(targetUrl, body);

    const duration = Date.now() - startTime;
    logger.info(`PATCH /comments/manage/${id} - 성공 (${status}) [${duration}ms]`);
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

      logger.error(`PATCH /comments/manage/${id} - 실패 (${status}) [${duration}ms]`);
      logger.error(`Error details:`, {
        status,
        message: axiosError.message,
        code: axiosError.code,
        responseData: axiosError.response?.data,
      });

      return NextResponse.json(payload, { status });
    }

    const err = error instanceof Error ? error : new Error("Unknown error");
    logger.error(`PATCH /comments/manage/${id} - 예외 발생 [${duration}ms]`, {
      message: err.message,
      stack: err.stack,
    });

    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// 댓글 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const startTime = Date.now();

  logger.info(`DELETE /comments/manage/${id} - 댓글 삭제 요청`);

  try {
    const axios = createAuthServerAxios(request);
    // DCS API: DELETE /api/comments/{id} (댓글 삭제)
    const targetUrl = `/dcs/api/comments/${id}`;
    logger.debug(`Forwarding to: ${targetUrl}`);

    const { status } = await axios.delete(targetUrl);

    const duration = Date.now() - startTime;
    logger.info(`DELETE /comments/manage/${id} - 성공 (${status}) [${duration}ms]`);

    if (status === 204) {
      return new Response(null, { status: 204 });
    }

    return NextResponse.json({ success: true }, { status });
  } catch (error: unknown) {
    const duration = Date.now() - startTime;

    if ((error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status ?? 500;
      const payload = axiosError.response?.data ?? {
        message: axiosError.message,
      };

      logger.error(`DELETE /comments/manage/${id} - 실패 (${status}) [${duration}ms]`);
      logger.error(`Error details:`, {
        status,
        message: axiosError.message,
        code: axiosError.code,
        responseData: axiosError.response?.data,
      });

      return NextResponse.json(payload, { status });
    }

    const err = error instanceof Error ? error : new Error("Unknown error");
    logger.error(`DELETE /comments/manage/${id} - 예외 발생 [${duration}ms]`, {
      message: err.message,
      stack: err.stack,
    });

    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
