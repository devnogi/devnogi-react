import { BOARDS_ENDPOINT } from "@/lib/api/constants";
import { createServerAxios } from "@/lib/api/server";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

// boards 요청 캐싱 기간 12시간 (매일 12시, 24시에 갱신)
export const revalidate = 43200; // 12시간 (초)

export async function GET(request: NextRequest) {
  try {
    const axios = createServerAxios(request);
    const { data, status } = await axios.get(BOARDS_ENDPOINT);
    return NextResponse.json(data, {
      status: status,
      headers: {
        "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=86400",
      },
    });
  } catch (error: unknown) {
    // AxiosError 처리(Gateway 통신 오류)
    if ((error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status ?? 500;
      const payload = axiosError.response?.data ?? {
        message: axiosError.message,
      };
      return NextResponse.json(payload, { status });
    }

    // 기타 오류
    const err = error instanceof Error ? error : new Error("Unknown error");
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
