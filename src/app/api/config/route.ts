import { NextResponse } from "next/server";

/**
 * 클라이언트에 노출할 런타임 설정을 반환합니다.
 */
export async function GET() {
  const gatewayUrl = process.env.GATEWAY_URL;

  if (!gatewayUrl) {
    return NextResponse.json(
      { error: "Gateway URL not configured" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    gatewayUrl,
    environment: process.env.NODE_ENV === "production" ? "production" : "development",
  });
}
