import { createAuthServerAxios } from "@/lib/api/server";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

// 댓글 좋아요 토글
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const axios = createAuthServerAxios(request);
    // DCS API: POST /api/comments/like (댓글 좋아요 토글)
    const { data, status } = await axios.post("/dcs/api/comments/like", body);
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
