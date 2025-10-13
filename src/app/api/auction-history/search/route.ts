import { NextRequest, NextResponse } from "next/server";

interface AuctionHistorySearchParams {
  itemName?: string;
  itemTopCategory?: string;
  itemSubCategory?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
}

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

export async function GET(request: NextRequest) {
  try {
    const gatewayUrl = process.env.GATEWAY_BASE_URL;
    if (!gatewayUrl) {
      throw new Error("GATEWAY_BASE_URL 환경 변수가 설정되지 않았습니다.");
    }

    const searchParams = request.nextUrl.searchParams;
    const params: AuctionHistorySearchParams = {
      itemName: searchParams.get("itemName") || "",
      itemTopCategory: searchParams.get("itemTopCategory") || undefined,
      itemSubCategory: searchParams.get("itemSubCategory") || undefined,
      page: searchParams.get("page")
        ? parseInt(searchParams.get("page")!)
        : 1,
      size: searchParams.get("size")
        ? parseInt(searchParams.get("size")!)
        : 20,
      sortBy: searchParams.get("sortBy") || "dateAuctionBuy",
      direction: searchParams.get("direction") || "desc",
    };

    // Build query string
    const queryParams = new URLSearchParams();
    if (params.itemName) queryParams.append("itemName", params.itemName);
    if (params.itemTopCategory)
      queryParams.append("itemTopCategory", params.itemTopCategory);
    if (params.itemSubCategory)
      queryParams.append("itemSubCategory", params.itemSubCategory);
    queryParams.append("page", params.page!.toString());
    queryParams.append("size", params.size!.toString());
    queryParams.append("sortBy", params.sortBy!);
    queryParams.append("direction", params.direction!);

    const response = await fetch(
      `${gatewayUrl}/oab/auction-history/search?${queryParams.toString()}`,
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
