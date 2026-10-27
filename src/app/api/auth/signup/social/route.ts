import { NextRequest, NextResponse } from "next/server";
import { createPublicAuthServerAxios } from "@/lib/api/server";
import { AUTH_ENDPOINT } from "@/lib/api/constants";

const noStore = { "Cache-Control": "no-store" };

export async function POST(request: NextRequest) {
  try {
    // FormData를 그대로 전달
    const formData = await request.formData();

    // Auth Server로 소셜 회원가입 요청
    const serverAxios = createPublicAuthServerAxios();
    const binding = request.cookies.get("oauth_flow_binding")?.value;
    const response = binding && /^[A-Za-z0-9_-]{43}$/.test(binding)
      ? await serverAxios.post(`${AUTH_ENDPOINT}/signup/social`, formData, {
          headers: { Cookie: `oauth_flow_binding=${binding}` },
        })
      : await serverAxios.post(`${AUTH_ENDPOINT}/signup/social`, formData);

    const nextResponse = NextResponse.json(response.data, { headers: noStore });

    const cookies = response.headers["set-cookie"];
    if (cookies) {
      if (Array.isArray(cookies)) {
        cookies.forEach((cookie) => nextResponse.headers.append("Set-Cookie", cookie));
      } else {
        nextResponse.headers.set("Set-Cookie", cookies);
      }
    }

    return nextResponse;

  } catch (error: unknown) {
    // AxiosError에는 요청 FormData가 포함될 수 있으므로 티켓을 로그에 남기지 않는다.
    console.error("소셜 회원가입 API 에러");

    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { status: number; data?: { message?: string; code?: string } } };
      if (axiosError.response) {
        return NextResponse.json(
          {
            success: false,
            message: axiosError.response.data?.message || "소셜 회원가입에 실패했습니다",
            code: axiosError.response.data?.code,
          },
          { status: axiosError.response.status, headers: noStore }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "서버 오류가 발생했습니다",
      },
      { status: 500, headers: noStore }
    );
  }
}
