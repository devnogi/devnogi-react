import { AxiosError } from "axios";
import { NextResponse } from "next/server";

import { USER_ENDPOINT } from "@/lib/api/constants";
import { createPublicAuthServerAxios } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;

  try {
    const axios = createPublicAuthServerAxios();
    const { data, status } = await axios.get(
      `${USER_ENDPOINT}/public/${userId}/profile`,
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
