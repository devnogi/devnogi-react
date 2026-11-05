import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

import { createServerAxios } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const { searchParams } = new URL(request.url);

  try {
    const axios = createServerAxios(request);
    const { data, status } = await axios.get(
      `/dcs/api/comments/user/${userId}`,
      {
        params: {
          page: searchParams.get("page") ?? "1",
          size: searchParams.get("size") ?? "20",
        },
      },
    );
    return NextResponse.json(data, { status });
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      return NextResponse.json(
        error.response?.data ?? { message: error.message },
        { status: error.response?.status ?? 500 },
      );
    }
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
