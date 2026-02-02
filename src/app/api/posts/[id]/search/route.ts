import { createServerAxios } from "@/lib/api/server";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

// posts 검색 요청 캐싱 기간 1분(초)
export const revalidate = 60;

// 게시판별 게시글 키워드 검색
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: boardId } = await params;
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ?? "1";
  const size = searchParams.get("size") ?? "20";
  const keyword = searchParams.get("keyword") ?? "";

  try {
    const axios = createServerAxios(request);
    // DCS API: GET /api/posts/{boardId}/search (게시판별 게시글 키워드 검색)
    const { data, status } = await axios.get(
      `/dcs/api/posts/${boardId}/search`,
      {
        params: {
          page,
          size,
          keyword,
        },
      }
    );
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
