import { AUCTION_HISTORY_ENDPOINT } from "@/lib/api/constants";
import { createServerAxios } from "@/lib/api/server";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

// auction-history 요청 캐싱 기간 30분(초)
export const dynamic = "force-dynamic";
export const revalidate = 1800;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = {
    page: searchParams.get("page") ?? "1",
    size: searchParams.get("size") ?? "20",
    sortBy: searchParams.get("sortBy") ?? "",
    direction: searchParams.get("direction") ?? "",
  };

  try {
    const axios = createServerAxios(request);
    const { data, status } = await axios.get(AUCTION_HISTORY_ENDPOINT, {
      params,
    });
    return NextResponse.json(data.items, { status: status });
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
