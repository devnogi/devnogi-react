import { createAuthServerAxios, createServerAxios } from "@/lib/api/server";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

// comments 요청 캐싱 기간 1분(초)
export const revalidate = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ?? "1";
  const size = searchParams.get("size") ?? "20";
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const direction = searchParams.get("direction") ?? "desc";

  try {
    const axios = createServerAxios(request);
    // DCS API: GET /api/comments/{postId} (게시글별 댓글 조회)
    const { data, status } = await axios.get(`/dcs/api/comments/${postId}`, {
      params: {
        page,
        size,
        sortBy,
        direction,
      },
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

// 댓글 작성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;

  try {
    const body = await request.json();
    const axios = createAuthServerAxios(request);
    // DCS API: POST /api/comments/{postId} (댓글 작성)
    const { data, status } = await axios.post(
      `/dcs/api/comments/${postId}`,
      body
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
