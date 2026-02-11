import { createServerAxios } from "@/lib/api/server";
import { HORN_BUGLE_ENDPOINT } from "@/lib/api/constants";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

// 캐싱 5분
export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const serverName = searchParams.get("serverName") || undefined;
  const keyword = searchParams.get("keyword") || undefined;
  const page = searchParams.get("page") ?? "1";
  const size = searchParams.get("size") ?? "20";

  try {
    const axios = createServerAxios(request);
    const { data, status } = await axios.get(HORN_BUGLE_ENDPOINT, {
      params: {
        serverName,
        keyword,
        page,
        size,
      },
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
