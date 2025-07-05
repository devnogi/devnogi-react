import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // TODO: 추후 확인 후 수정 필요
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/ui-preview/auction", request.url));
  }

  return NextResponse.next();
}
