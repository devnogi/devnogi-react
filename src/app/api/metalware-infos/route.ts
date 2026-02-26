import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

interface Category {
  id: string;
  name: string;
  children?: Category[];
}

interface MetalwareData {
  categories: Category[];
}

interface BackendApiResponse {
  success: boolean;
  code: string;
  message: string;
  data: MetalwareData;
  timestamp: string;
}

interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

/** categories 트리를 재귀적으로 순회해 모든 name을 평탄화 */
function extractCategoryNames(categories: Category[]): string[] {
  const names: string[] = [];
  for (const cat of categories) {
    if (cat.id === "all") {
      // 루트 노드("전체")는 이름 제외, 자식만 처리
      if (cat.children) names.push(...extractCategoryNames(cat.children));
    } else {
      names.push(cat.name);
      if (cat.children) names.push(...extractCategoryNames(cat.children));
    }
  }
  return names;
}

export async function GET() {
  try {
    const gatewayUrl = process.env.GATEWAY_URL;
    if (!gatewayUrl) {
      throw new Error("GATEWAY_URL 환경 변수가 설정되지 않았습니다.");
    }

    const response = await fetch(`${gatewayUrl}/oab/api/metalware-infos`, {
      next: { revalidate: 3600 }, // 1시간 캐시
    });

    if (!response.ok) {
      throw new Error(`OAB API 호출 실패: ${response.status}`);
    }

    // 백엔드가 이미 표준 응답 포맷({ success, code, message, data, timestamp })으로 반환
    const backendResponse: BackendApiResponse = await response.json();

    if (!backendResponse.success) {
      throw new Error(backendResponse.message || "세공 정보 조회 실패");
    }

    // categories 트리에서 모든 카테고리 이름을 평탄화
    const metalwareList = extractCategoryNames(
      backendResponse.data?.categories ?? [],
    );

    return NextResponse.json(
      {
        success: true,
        code: "COMMON_SUCCESS",
        message: "요청이 성공적으로 처리되었습니다.",
        data: metalwareList,
        timestamp: new Date().toISOString(),
      } as ApiResponse<string[]>,
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
