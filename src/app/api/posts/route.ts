import { POSTS_ENDPOINT } from "@/lib/api/constants";
import { createServerAxios } from "@/lib/api/server";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

// posts 요청 캐싱 기간 5분(초)
export const revalidate = 300;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = {
    boardId: searchParams.get("boardId") ?? "",
    page: searchParams.get("page") ?? "0",
    size: searchParams.get("size") ?? "20",
    sort: searchParams.get("sort") ?? "latest",
    search: searchParams.get("search") ?? "",
  };

  try {
    const axios = createServerAxios(request);
    const { data, status } = await axios.get(POSTS_ENDPOINT, {
      params,
    });
    return NextResponse.json(data, { status: status });
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
