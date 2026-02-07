import { NextRequest, NextResponse } from "next/server";
import { createAuthServerAxios } from "@/lib/api/server";
import { AUTH_ENDPOINT } from "@/lib/api/constants";

export async function POST(request: NextRequest) {
  try {
    const serverAxios = createAuthServerAxios(request);
    const response = await serverAxios.post(`${AUTH_ENDPOINT}/logout`);

    const cookies = response.headers["set-cookie"];
    const nextResponse = NextResponse.json(response.data);

    if (cookies) {
      if (Array.isArray(cookies)) {
        cookies.forEach((cookie) =>
          nextResponse.headers.append("Set-Cookie", cookie)
        );
      } else {
        nextResponse.headers.set("Set-Cookie", cookies);
      }
    }

    return nextResponse;
  } catch {
    const response = NextResponse.json({
      success: true,
      message: "로그아웃 성공",
    });

    response.cookies.set("access_token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 0,
      path: "/",
      domain: ".memonogi.com",
    });

    response.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 0,
      path: "/",
      domain: ".memonogi.com",
    });

    return response;
  }
}
