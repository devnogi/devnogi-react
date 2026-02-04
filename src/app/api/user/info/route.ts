import { USER_ENDPOINT } from "@/lib/api/constants";
import { createAuthServerAxios } from "@/lib/api/server";
import { createLogger } from "@/lib/logger";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("API/user/info");

// 사용자 정보 수정
export async function PUT(request: NextRequest) {
  logger.info("========== PUT /api/user/info 요청 시작 ==========");

  try {
    const formData = await request.formData();

    // FormData 내용 로깅
    const formDataEntries: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (value instanceof File) {
        formDataEntries[key] = `[File: ${value.name}, size: ${value.size} bytes, type: ${value.type}]`;
      } else {
        formDataEntries[key] = String(value);
      }
    });
    logger.info("FormData 내용:", formDataEntries);

    const axios = createAuthServerAxios(request);

    // DAS API: PUT /api/user/info (사용자 정보 수정)
    logger.info(`Gateway 요청: PUT ${USER_ENDPOINT}/info`);

    const { data, status } = await axios.put(`${USER_ENDPOINT}/info`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    logger.info(`Gateway 응답: status=${status}`, data);
    logger.info("========== PUT /api/user/info 요청 완료 ==========");

    return NextResponse.json(data, { status });
  } catch (error: unknown) {
    logger.error("PUT /api/user/info 에러 발생");

    if ((error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status ?? 500;
      const payload = axiosError.response?.data ?? {
        message: axiosError.message,
      };

      logger.error(`Axios 에러: status=${status}`, payload);
      logger.error("========== PUT /api/user/info 요청 실패 ==========");

      return NextResponse.json(payload, { status });
    }

    const err = error instanceof Error ? error : new Error("Unknown error");
    logger.error(`일반 에러: ${err.message}`);
    logger.error("========== PUT /api/user/info 요청 실패 ==========");

    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
