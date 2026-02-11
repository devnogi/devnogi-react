import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

/**
 * 클라이언트에 노출할 런타임 설정을 반환합니다.
 */
export async function GET() {
  const gatewayUrl = process.env.GATEWAY_URL;
  const socialAuthBaseUrl =
    process.env.SOCIAL_AUTH_BASE_URL || "https://api.memonogi.com";

  if (!gatewayUrl) {
    return NextResponse.json(
      { error: "Gateway URL not configured" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    gatewayUrl,
    socialAuthBaseUrl,
    environment: process.env.NODE_ENV === "production" ? "production" : "development",
  });
}
