import { RANKINGS_CATEGORY_ENDPOINT } from "@/lib/api/constants";
import { createServerAxios } from "@/lib/api/server";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

// 랭킹 데이터 캐싱 기간 5분(초)
export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "top-priced"; // top-priced | popular
  const topCategory = searchParams.get("topCategory") ?? "";
  const subCategory = searchParams.get("subCategory") ?? "";
  const limit = searchParams.get("limit") ?? "100";

  const endpoint =
    type === "popular"
      ? `${RANKINGS_CATEGORY_ENDPOINT}/popular`
      : `${RANKINGS_CATEGORY_ENDPOINT}/top-priced`;

  try {
    const axios = createServerAxios(request);
    const { data, status } = await axios.get(endpoint, {
      params: { topCategory, subCategory, limit },
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
