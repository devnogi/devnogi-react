import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

interface FieldMetadata {
  type: string;
  required: boolean;
  allowedValues?: string[];
}

interface SearchOptionMetadata {
  id: number;
  searchOptionName: string;
  searchCondition: Record<string, FieldMetadata>;
  displayOrder: number;
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

    const response = await fetch(`${gatewayUrl}/oab/api/search-option`, {
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!response.ok) {
      throw new Error(`OAB API 호출 실패: ${response.status}`);
    }

    const apiResponse: ApiResponse<SearchOptionMetadata[]> =
      await response.json();

    if (!apiResponse.success) {
      throw new Error(apiResponse.message || "검색 옵션 조회 실패");
    }

    return NextResponse.json(
      {
        success: true,
        code: "COMMON_SUCCESS",
        message: "요청이 성공적으로 처리되었습니다.",
        data: apiResponse.data,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      },
    );
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    console.error("Search option API error:", err);
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
