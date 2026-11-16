import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

import { HORN_BUGLE_ENDPOINT } from "@/lib/api/constants";
import { createServerAxios } from "@/lib/api/server";
import { parseHornBugleResponse } from "@/lib/horn-bugle";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const serverName = searchParams.get("serverName") || undefined;
  const keyword = searchParams.get("keyword") || undefined;
  const page = searchParams.get("page") ?? "1";
  const size = searchParams.get("size") ?? "20";

  try {
    const axios = createServerAxios(request);
    const { data, status } = await axios.get(HORN_BUGLE_ENDPOINT, {
      signal: request.signal,
      params: {
        serverName,
        keyword,
        page,
        size,
      },
    });
    parseHornBugleResponse(data);
    return NextResponse.json(data, { status, headers });
  } catch (error: unknown) {
    if ((error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status ?? 500;
      const payload = axiosError.response?.data ?? {
        message: axiosError.message,
      };
      return NextResponse.json(payload, { status, headers });
    }

    return NextResponse.json(
      { success: false, message: "뿔피리 정보를 불러오지 못했습니다." },
      { status: 502, headers },
    );
  }
}
