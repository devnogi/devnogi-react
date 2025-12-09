import { NextRequest, NextResponse } from "next/server";
import { AuctionHistorySearchParams } from "@/types/auction-history";

interface ItemOption {
  id: string;
  optionType: string;
  optionSubType: string | null;
  optionValue: string;
  optionValue2: string | null;
  optionDesc: string | null;
}

interface AuctionHistoryItem {
  itemName: string;
  itemDisplayName: string;
  itemCount: number;
  auctionPricePerUnit: number;
  dateAuctionBuy: string;
  auctionBuyId: string;
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

interface AuctionHistoryResponse {
  items: AuctionHistoryItem[];
  meta: PageMeta;
}

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

export async function GET(request: NextRequest) {
  try {
    const gatewayUrl = process.env.GATEWAY_BASE_URL;
    if (!gatewayUrl) {
      throw new Error("GATEWAY_BASE_URL 환경 변수가 설정되지 않았습니다.");
    }

    const searchParams = request.nextUrl.searchParams;

    // Separate pagination params (PageRequestDto) and search params (AuctionHistorySearchRequest)
    const pageParams: Record<string, string> = {};
    const searchRequest: Record<string, unknown> = {};

    // Extract pagination parameters
    const page = searchParams.get("page") || "1";
    const size = searchParams.get("size") || "20";
    const sortBy = searchParams.get("sortBy") || "DATE_AUCTION_BUY"; // enum value
    const direction = searchParams.get("direction") || "DESC"; // enum value

    pageParams.page = page;
    pageParams.size = size;
    pageParams.sortBy = sortBy;
    pageParams.direction = direction;

    // Extract basic search parameters
    const itemName = searchParams.get("itemName");
    const itemTopCategory = searchParams.get("itemTopCategory");
    const itemSubCategory = searchParams.get("itemSubCategory");

    if (itemName) searchRequest.itemName = itemName;
    if (itemTopCategory) searchRequest.itemTopCategory = itemTopCategory;
    if (itemSubCategory) searchRequest.itemSubCategory = itemSubCategory;

    // Extract nested filter parameters (priceSearchRequest, dateAuctionBuyRequest, itemOptionSearchRequest)
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
      `${gatewayUrl}/oab/auction-history/search?${queryString}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      },
    );

    if (!response.ok) {
      throw new Error(`OAB API 호출 실패: ${response.status}`);
    }

    const apiResponse: ApiResponse<AuctionHistoryResponse> =
      await response.json();

    if (!apiResponse.success) {
      throw new Error(apiResponse.message || "경매 내역 조회 실패");
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
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    console.error("Auction history search API error:", err);
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
