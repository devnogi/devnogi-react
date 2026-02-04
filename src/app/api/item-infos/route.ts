import { NextResponse } from "next/server";

// 6시간 간격 캐싱 (0, 6, 12, 18시)
// 다음 캐시 갱신 시간까지의 초를 계산하는 함수
function getSecondsUntilNextCacheUpdate(): number {
  const now = new Date();
  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes();
  const currentSecond = now.getUTCSeconds();

  // 캐시 갱신 시간 (UTC 기준: 0, 6, 12, 18시)
  const cacheUpdateHours = [0, 6, 12, 18];

  // 다음 캐시 갱신 시간 찾기
  let nextUpdateHour = cacheUpdateHours.find((hour) => hour > currentHour);

  // 오늘 갱신 시간이 없으면 다음날 0시
  if (nextUpdateHour === undefined) {
    nextUpdateHour = 24; // 다음날 0시
  }

  // 다음 갱신까지 남은 시간 계산
  const hoursUntilUpdate = nextUpdateHour - currentHour;
  const minutesUntilUpdate = 60 - currentMinute;
  const secondsUntilUpdate = 60 - currentSecond;

  return (
    (hoursUntilUpdate - 1) * 3600 + minutesUntilUpdate * 60 + secondsUntilUpdate
  );
}

export const revalidate = 21600; // 6시간 (기본값)

interface ItemInfoSummaryResponse {
  name: string;
  topCategory: string;
  subCategory: string;
}

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

export async function GET() {
  try {
    const gatewayUrl = process.env.GATEWAY_URL;
    if (!gatewayUrl) {
      throw new Error("GATEWAY_URL 환경 변수가 설정되지 않았습니다.");
    }

    const secondsUntilNextUpdate = getSecondsUntilNextCacheUpdate();

    // 1. 먼저 카테고리 정보를 가져옴
    const categoriesResponse = await fetch(
      `${gatewayUrl}/oab/api/item-infos/categories`,
      {
        next: { revalidate: secondsUntilNextUpdate },
      },
    );

    if (!categoriesResponse.ok) {
      throw new Error(
        `카테고리 API 호출 실패: ${categoriesResponse.status}`,
      );
    }

    const categoriesApiResponse: ApiResponse<ItemCategoryResponse[]> =
      await categoriesResponse.json();

    if (!categoriesApiResponse.success) {
      throw new Error(
        categoriesApiResponse.message || "카테고리 조회 실패",
      );
    }

    // 2. 각 카테고리별로 summary API 호출
    const summaryPromises = categoriesApiResponse.data.map(
      async ({ topCategory, subCategory }) => {
        try {
          const params = new URLSearchParams({
            topCategory,
            subCategory,
          });

          const response = await fetch(
            `${gatewayUrl}/oab/api/item-infos/summary?${params.toString()}`,
            {
              next: { revalidate: secondsUntilNextUpdate },
            },
          );

          if (!response.ok) {
            console.error(
              `[item-infos] Summary API 호출 실패 (${topCategory}/${subCategory}): ${response.status}`,
            );
            return [];
          }

          const apiResponse: ApiResponse<ItemInfoSummaryResponse[]> =
            await response.json();

          if (!apiResponse.success) {
            console.error(
              `[item-infos] Summary API 실패 (${topCategory}/${subCategory}): ${apiResponse.message}`,
            );
            return [];
          }

          return apiResponse.data;
        } catch (fetchError) {
          // 개별 fetch 에러를 잡아서 전체 Promise.all이 실패하지 않도록 함
          console.error(
            `[item-infos] Summary API fetch 에러 (${topCategory}/${subCategory}):`,
            fetchError instanceof Error ? fetchError.message : fetchError,
          );
          return [];
        }
      },
    );

    // 3. 모든 요청을 병렬로 처리하고 결과를 합침 (Promise.allSettled로 개별 실패 허용)
    const summaryResults = await Promise.all(summaryPromises);
    const allItemInfos = summaryResults.flat();

    return NextResponse.json(
      {
        success: true,
        code: "COMMON_SUCCESS",
        message: "요청이 성공적으로 처리되었습니다.",
        data: allItemInfos,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": `public, s-maxage=${secondsUntilNextUpdate}, stale-while-revalidate=21600`,
        },
      },
    );
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    console.error("Item infos API error:", err);
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
