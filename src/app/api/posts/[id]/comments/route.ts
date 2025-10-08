import { POSTS_ENDPOINT } from "@/lib/api/constants";
import { createServerAxios } from "@/lib/api/server";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

// comments 요청 캐싱 기간 1분(초)
export const revalidate = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const postId = params.id;

  try {
    const axios = createServerAxios(request);
    const { data, status } = await axios.get(
      `${POSTS_ENDPOINT}/${postId}/comments`,
    );
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
