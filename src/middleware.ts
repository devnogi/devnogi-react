import { NextRequest, NextResponse } from "next/server";

const CANONICAL_HOST = "www.memonogi.com";
const LEGACY_HOST = "memonogi.com";

function getRequestHost(request: NextRequest): string {
  return (
    request.headers.get("host")?.toLowerCase() ??
    request.nextUrl.host.toLowerCase()
  );
}

export function middleware(request: NextRequest) {
  const host = getRequestHost(request);

  if (host === LEGACY_HOST) {
    const canonicalUrl = new URL(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
      `https://${CANONICAL_HOST}`,
    );

    return NextResponse.redirect(canonicalUrl, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
