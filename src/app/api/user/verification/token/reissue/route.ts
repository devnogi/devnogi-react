import { USER_VERIFICATION_ENDPOINT } from "@/lib/api/constants";
import { createAuthServerAxios } from "@/lib/api/server";
import { createLogger } from "@/lib/logger";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("API/user/verification/token/reissue");

export async function POST(request: NextRequest) {
  logger.info("========== POST /api/user/verification/token/reissue 요청 시작 ==========");

  try {
    const axios = createAuthServerAxios(request);
    const { data, status } = await axios.post(
      `${USER_VERIFICATION_ENDPOINT}/token/reissue`
    );

    logger.info(`Gateway 응답: status=${status}`, data);
    logger.info("========== POST /api/user/verification/token/reissue 요청 완료 ==========");

    return NextResponse.json(data, { status });
  } catch (error: unknown) {
    logger.error("POST /api/user/verification/token/reissue 에러 발생");

    if ((error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status ?? 500;
      const payload = axiosError.response?.data ?? { message: axiosError.message };

      logger.error(`Axios 에러: status=${status}`, payload);
      return NextResponse.json(payload, { status });
    }

    const err = error instanceof Error ? error : new Error("Unknown error");
    logger.error(`일반 에러: ${err.message}`);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
