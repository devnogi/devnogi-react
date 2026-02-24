import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

interface MetalwareInfoResponse {
  metalware: string;
}

interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

export async function GET() {
  try {
    const gatewayUrl = process.env.GATEWAY_URL;
    if (!gatewayUrl) {
      throw new Error("GATEWAY_URL 환경 변수가 설정되지 않았습니다.");
    }

    const response = await fetch(`${gatewayUrl}/oab/api/metalware-infos`, {
      next: { revalidate: 3600 }, // 1시간 캐시 (세공 정보는 자주 변경되지 않음)
    });

    if (!response.ok) {
      throw new Error(`OAB API 호출 실패: ${response.status}`);
    }

    const data: MetalwareInfoResponse[] = await response.json();

    return NextResponse.json(
      {
        success: true,
        code: "COMMON_SUCCESS",
        message: "요청이 성공적으로 처리되었습니다.",
        data,
        timestamp: new Date().toISOString(),
      } as ApiResponse<MetalwareInfoResponse[]>,
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      },
    );
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    console.error("Metalware infos API error:", err);
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
