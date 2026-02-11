import { createServerAxios } from "@/lib/api/server";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

// posts 요청 캐싱 기간 5분(초)
export const dynamic = "force-dynamic";
export const revalidate = 300;

// 유저별 게시글 리스트 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ?? "1";
  const size = searchParams.get("size") ?? "20";

  try {
    const axios = createServerAxios(request);
    // DCS API: GET /api/posts/user/{userId} (유저별 게시글 리스트 조회)
    const { data, status } = await axios.get(`/dcs/api/posts/user/${userId}`, {
      params: {
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
