import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 1800; // 30분 캐싱

export async function GET(request: NextRequest) {
  try {
    const gatewayUrl = process.env.GATEWAY_URL;
    if (!gatewayUrl) {
      throw new Error("GATEWAY_URL 환경 변수가 설정되지 않았습니다.");
    }

    const { searchParams } = new URL(request.url);
    const affixPosition = searchParams.get("affix_position");

    const upstreamUrl = new URL(`${gatewayUrl}/oab/api/enchant-infos/fullnames`);
    if (affixPosition) {
      upstreamUrl.searchParams.set("affix_position", affixPosition);
    }

    const response = await fetch(upstreamUrl.toString(), {
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    console.error("Enchant fullnames API error:", err);
    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        message: err.message,
        data: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
