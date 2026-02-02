import { USER_ENDPOINT } from "@/lib/api/constants";
import { createAuthServerAxios } from "@/lib/api/server";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

// 회원 탈퇴
export async function PATCH(request: NextRequest) {
  try {
    const axios = createAuthServerAxios(request);
    // DAS API: PATCH /api/user/withdraw (회원 탈퇴)
    const { data, status } = await axios.patch(`${USER_ENDPOINT}/withdraw`);
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
