import { createAuthServerAxios } from "@/lib/api/server";
import { REPORTS_ENDPOINT } from "@/lib/api/constants";
import { createLogger } from "@/lib/logger";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("API/reports");

// 신고 생성
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  logger.info(`POST /reports - 신고 생성 요청`);

  try {
    const body = await request.json();
    logger.debug(`Request body:`, body);

    const axios = createAuthServerAxios(request);

    logger.debug(`Forwarding to: ${REPORTS_ENDPOINT}`);

    const { data, status } = await axios.post(REPORTS_ENDPOINT, body);

    const duration = Date.now() - startTime;
    logger.info(`POST /reports - 성공 (${status}) [${duration}ms]`);
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

      logger.error(`POST /reports - 실패 (${status}) [${duration}ms]`);
      logger.error(`Error details:`, {
        status,
        message: axiosError.message,
        code: axiosError.code,
        responseData: axiosError.response?.data,
      });

      return NextResponse.json(payload, { status });
    }

    const err = error instanceof Error ? error : new Error("Unknown error");
    logger.error(`POST /reports - 예외 발생 [${duration}ms]`, {
      message: err.message,
      stack: err.stack,
    });

    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
