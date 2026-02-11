import { RANKINGS_ALL_TIME_ENDPOINT } from "@/lib/api/constants";
import { createServerAxios } from "@/lib/api/server";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

// 랭킹 데이터 캐싱 기간 5분(초)
export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "highest-price"; // highest-price | month-largest
  const limit = searchParams.get("limit") ?? "100";

  const endpoint =
    type === "month-largest"
      ? `${RANKINGS_ALL_TIME_ENDPOINT}/month/largest`
      : `${RANKINGS_ALL_TIME_ENDPOINT}/highest-price`;

  try {
    const axios = createServerAxios(request);
    const { data, status } = await axios.get(endpoint, {
      params: { limit },
    });
    return NextResponse.json(data, { status });
  } catch (error: unknown) {
    if ((error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status ?? 500;
      const payload = axiosError.response?.data ?? {
        message: axiosError.message,
      };
      return NextResponse.json(payload, { status });
    }

    const err = error instanceof Error ? error : new Error("Unknown error");
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
