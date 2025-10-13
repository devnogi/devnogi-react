import { NextRequest, NextResponse } from "next/server";

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

interface ItemInfoResponse {
  name: string;
  topCategory: string;
  subCategory: string;
  description: string | null;
  inventoryWidth: number | null;
  inventoryHeight: number | null;
  inventoryMaxBundleCount: number | null;
  history: string | null;
  acquisitionMethod: string | null;
  storeSalesPrice: string | null;
  weaponType: string | null;
  repair: string | null;
  maxAlterationCount: number | null;
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
    const gatewayUrl = process.env.GATEWAY_BASE_URL;
    if (!gatewayUrl) {
      throw new Error("GATEWAY_BASE_URL 환경 변수가 설정되지 않았습니다.");
    }

    const secondsUntilNextUpdate = getSecondsUntilNextCacheUpdate();

    const response = await fetch(`${gatewayUrl}/oab/api/item-infos`, {
      next: { revalidate: secondsUntilNextUpdate }, // 다음 갱신 시간까지 캐싱
    });

    if (!response.ok) {
      throw new Error(`OAB API 호출 실패: ${response.status}`);
    }

    const apiResponse: ApiResponse<ItemInfoResponse[]> = await response.json();

    if (!apiResponse.success) {
      throw new Error(apiResponse.message || "아이템 정보 조회 실패");
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
