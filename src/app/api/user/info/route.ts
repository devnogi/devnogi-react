import { USER_ENDPOINT } from "@/lib/api/constants";
import { createAuthServerAxios } from "@/lib/api/server";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

// 사용자 정보 수정
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const axios = createAuthServerAxios(request);
    // DAS API: PUT /api/user/info (사용자 정보 수정)
    const { data, status } = await axios.put(`${USER_ENDPOINT}/info`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
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
