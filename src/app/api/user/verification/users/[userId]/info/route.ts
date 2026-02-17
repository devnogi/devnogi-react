import { USER_VERIFICATION_ENDPOINT } from "@/lib/api/constants";
import { createServerAxios } from "@/lib/api/server";
import { createLogger } from "@/lib/logger";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("API/user/verification/users/info");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  logger.info(`========== GET /api/user/verification/users/${userId}/info 요청 시작 ==========`);

  try {
    const axios = createServerAxios(request);
    const { data, status } = await axios.get(
      `${USER_VERIFICATION_ENDPOINT}/users/${userId}/info`
    );

    logger.info(`Gateway 응답: status=${status}`, data);
    logger.info(`========== GET /api/user/verification/users/${userId}/info 요청 완료 ==========`);

    return NextResponse.json(data, { status });
  } catch (error: unknown) {
    logger.error(`GET /api/user/verification/users/${userId}/info 에러 발생`);

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
