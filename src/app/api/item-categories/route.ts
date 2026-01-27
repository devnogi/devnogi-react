import { NextResponse } from "next/server";

// 12시간 캐싱 (매일 12시, 24시에 갱신)
export const revalidate = 43200; // 12시간 (초)

interface ItemCategoryResponse {
  topCategory: string;
  subCategory: string;
}

interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

interface HierarchicalCategory {
  id: string;
  name: string;
  children?: HierarchicalCategory[];
}

function transformCategoriesToHierarchy(
  categories: ItemCategoryResponse[]
): HierarchicalCategory[] {
  const topCategoryMap = new Map<string, HierarchicalCategory>();

  // topCategory별로 그룹화
  categories.forEach(({ topCategory, subCategory }) => {
    if (!topCategoryMap.has(topCategory)) {
      topCategoryMap.set(topCategory, {
        id: topCategory,
        name: topCategory,
        children: [],
      });
    }

    const topCat = topCategoryMap.get(topCategory)!;
    topCat.children!.push({
      id: `${topCategory}/${subCategory}`,
      name: subCategory,
    });
  });

  // "전체" 카테고리를 최상단에 추가
  const hierarchy: HierarchicalCategory[] = [
    {
      id: "all",
      name: "전체",
      children: Array.from(topCategoryMap.values()),
    },
  ];

  return hierarchy;
}

export async function GET() {
  try {
    const gatewayUrl = process.env.GATEWAY_URL;
    if (!gatewayUrl) {
      throw new Error("GATEWAY_URL 환경 변수가 설정되지 않았습니다.");
    }

    const response = await fetch(`${gatewayUrl}/oab/api/item-infos/categories`, {
      next: { revalidate: 43200 }, // 12시간 캐싱
    });

    if (!response.ok) {
      throw new Error(`OAB API 호출 실패: ${response.status}`);
    }

    const apiResponse: ApiResponse<ItemCategoryResponse[]> = await response.json();

    if (!apiResponse.success) {
      throw new Error(apiResponse.message || "카테고리 조회 실패");
    }

    const hierarchicalCategories = transformCategoriesToHierarchy(apiResponse.data);

    return NextResponse.json(
      {
        success: true,
        code: "COMMON_SUCCESS",
        message: "요청이 성공적으로 처리되었습니다.",
        data: {
          categories: hierarchicalCategories,
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    console.error("Item categories API error:", err);
    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        message: err.message,
        data: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
