import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

interface ItemOption {
  id: string;
  optionType: string;
  optionSubType: string | null;
  optionValue: string;
  optionValue2: string | null;
  optionDesc: string | null;
}

interface AuctionRealtimeItem {
  itemName: string;
  itemDisplayName: string;
  itemCount: number;
  auctionPricePerUnit: number;
  dateAuctionExpire: string;
  dateAuctionRegister: string;
  auctionId: string;
  itemSubCategory: string;
  itemTopCategory: string;
  itemOptions: ItemOption[];
}

interface PageMeta {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  isFirst: boolean;
  isLast: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

interface AuctionRealtimeResponse {
  items: AuctionRealtimeItem[];
  meta: PageMeta;
}

const MIN_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

/**
 * Nested object를 Spring Boot @ModelAttribute 형식의 query parameter로 변환
 * 예: { priceSearchRequest: { priceFrom: 10000 } } -> "priceSearchRequest.priceFrom=10000"
 */
function buildNestedQueryParams(
  obj: Record<string, unknown>,
  prefix = "",
): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined || value === "") {
      return; // Skip empty values
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      // Recursively handle nested objects
      const nestedParams = buildNestedQueryParams(
        value as Record<string, unknown>,
        fullKey,
      );
      nestedParams.forEach((v, k) => params.append(k, v));
    } else {
      // Primitive values
      params.append(fullKey, String(value));
    }
  });

  return params;
}

function clampNumber(
  value: string | null,
  fallback: number,
  min: number,
  max?: number,
) {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  let normalized = Math.floor(parsed);
  if (normalized < min) {
    normalized = min;
  }
  if (max !== undefined && normalized > max) {
    normalized = max;
  }
  return normalized;
}

export async function GET(request: NextRequest) {
  try {
    const gatewayUrl = process.env.GATEWAY_URL;
    if (!gatewayUrl) {
      throw new Error("GATEWAY_URL 환경 변수가 설정되지 않았습니다.");
    }

    const searchParams = request.nextUrl.searchParams;

    // Separate pagination params (PageRequestDto) and search params (AuctionRealtimeSearchRequest)
    const pageParams: Record<string, string> = {};
    const searchRequest: Record<string, unknown> = {};

    // Extract pagination parameters
    const page = clampNumber(searchParams.get("page"), 1, 1);
    const size = clampNumber(
      searchParams.get("size"),
      20,
      MIN_PAGE_SIZE,
      MAX_PAGE_SIZE,
    );
    // 실시간 경매장 기본 정렬: 만료일 내림차순 (최근 등록/남은 시간 순)
    const sortBy = searchParams.get("sortBy") || "dateAuctionExpire";
    const direction = searchParams.get("direction") || "desc";

    // Map frontend values to backend enum names
    const sortByMap: Record<string, string> = {
      dateAuctionExpire: "DATE_AUCTION_EXPIRE",
      dateAuctionRegister: "DATE_AUCTION_REGISTER",
      auctionPricePerUnit: "AUCTION_PRICE_PER_UNIT",
      itemName: "ITEM_NAME",
    };

    const directionMap: Record<string, string> = {
      asc: "ASC",
      desc: "DESC",
    };

    pageParams.page = page.toString();
    pageParams.size = size.toString();
    pageParams.sortBy = sortByMap[sortBy] || "DATE_AUCTION_EXPIRE";
    pageParams.direction = directionMap[direction.toLowerCase()] || "DESC";

    // Extract basic search parameters
    const itemName = searchParams.get("itemName");
    const itemTopCategory = searchParams.get("itemTopCategory");
    const itemSubCategory = searchParams.get("itemSubCategory");

    if (itemName) searchRequest.itemName = itemName;
    if (itemTopCategory) searchRequest.itemTopCategory = itemTopCategory;
    if (itemSubCategory) searchRequest.itemSubCategory = itemSubCategory;

    // Extract nested filter parameters (priceSearchRequest, itemOptionSearchRequest)
    // 실시간 경매장은 날짜 필터(dateAuctionBuyRequest)가 없음
    searchParams.forEach((value, key) => {
      // Skip pagination and basic search params
      if (
        [
          "itemName",
          "itemTopCategory",
          "itemSubCategory",
          "page",
          "size",
          "sortBy",
          "direction",
        ].includes(key)
      ) {
        return;
      }

      // Parse nested keys like "priceSearchRequest.priceFrom"
      const parts = key.split(".");
      if (parts.length > 1) {
        let current: Record<string, unknown> = searchRequest;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]] as Record<string, unknown>;
        }
        const lastKey = parts[parts.length - 1];
        // Try to parse as number if possible
        const numValue = Number(value);
        current[lastKey] = isNaN(numValue) ? value : numValue;
      }
    });

    // Build query string - pagination params first, then search params
    const queryParams = new URLSearchParams(pageParams);

    // Add basic search params
    Object.entries(searchRequest).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        return;
      }

      if (typeof value === "object" && !Array.isArray(value)) {
        // Handle nested objects with dot notation
        const nestedParams = buildNestedQueryParams(
          value as Record<string, unknown>,
          key,
        );
        nestedParams.forEach((v, k) => queryParams.append(k, v));
      } else {
        // Primitive values
        queryParams.append(key, String(value));
      }
    });

    // URLSearchParams encodes spaces as '+', but backend expects '%20'
    const queryString = queryParams.toString().replace(/\+/g, "%20");

    const response = await fetch(
      `${gatewayUrl}/oab/auction-realtime/search?${queryString}`,
      {
        next: { revalidate: 60 }, // Cache for 1 minute (실시간 데이터라 짧게)
      },
    );

    if (!response.ok) {
      throw new Error(`OAB API 호출 실패: ${response.status}`);
    }

    const apiResponse: ApiResponse<AuctionRealtimeResponse> =
      await response.json();

    if (!apiResponse.success) {
      throw new Error(apiResponse.message || "실시간 경매장 조회 실패");
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
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    console.error("Auction realtime search API error:", err);
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
