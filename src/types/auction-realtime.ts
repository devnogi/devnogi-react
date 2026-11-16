/**
 * 실시간 경매장 검색 타입 정의
 * 백엔드 API의 Request DTO 구조와 일치하도록 설계
 * auction-history.ts와 유사하지만 날짜 필터(dateAuctionBuyRequest)가 없음
 */

import {
  EnchantSearchRequest,
  ItemOptionSearchRequest,
  MetalwareSearchRequest,
  PriceSearchRequest,
} from "./auction-history";

// Re-export shared types

/**
 * 실시간 경매장 검색 조건
 * Backend: AuctionRealtimeSearchRequest
 * 거래내역과 달리 날짜 필터(dateAuctionBuyRequest)가 없음
 */
interface AuctionRealtimeSearchRequest {
  itemName?: string;
  isExactItemName?: boolean;
  itemTopCategory?: string;
  itemSubCategory?: string;
  priceSearchRequest?: PriceSearchRequest;
  itemOptionSearchRequest?: ItemOptionSearchRequest;
  enchantSearchRequest?: EnchantSearchRequest;
  metalwareSearchRequests?: MetalwareSearchRequest[];
}

/**
 * 실시간 경매장 검색 파라미터 (페이지네이션 포함)
 * Backend: PageRequestDto + AuctionRealtimeSearchRequest
 */
export interface AuctionRealtimeSearchParams
  extends AuctionRealtimeSearchRequest {
  // 페이지네이션
  page?: number;
  size?: number;
  sortBy?: string; // dateAuctionExpire, dateAuctionRegister, auctionPricePerUnit, itemName
  direction?: "asc" | "desc";
}

interface ItemOption {
  id: string;
  optionType: string;
  optionSubType: string | null;
  optionValue: string;
  optionValue2: string | null;
  optionDesc: string | null;
}

export interface AuctionRealtimeItem {
  id: number;
  itemName: string;
  itemDisplayName: string;
  itemCount: number;
  auctionPricePerUnit: number;
  dateAuctionExpire: string;
  dateRegister: string;
  itemSubCategory: string;
  itemTopCategory: string;
  itemOptions: ItemOption[];
}

export interface AuctionRealtimeResponse {
  items: AuctionRealtimeItem[];
  meta: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    isFirst: boolean;
    isLast: boolean;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isAuctionRealtimeItem(
  value: unknown,
): value is AuctionRealtimeItem {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    Number.isSafeInteger(value.id) &&
    value.id > 0 &&
    typeof value.itemName === "string" &&
    typeof value.itemDisplayName === "string" &&
    typeof value.itemCount === "number" &&
    Number.isFinite(value.itemCount) &&
    typeof value.auctionPricePerUnit === "number" &&
    Number.isFinite(value.auctionPricePerUnit) &&
    typeof value.dateAuctionExpire === "string" &&
    typeof value.dateRegister === "string" &&
    typeof value.itemSubCategory === "string" &&
    typeof value.itemTopCategory === "string" &&
    Array.isArray(value.itemOptions) &&
    value.itemOptions.every(
      (option) =>
        isRecord(option) &&
        typeof option.optionType === "string" &&
        typeof option.optionValue === "string" &&
        [option.optionDesc, option.optionSubType, option.optionValue2].every(
          (field) => field == null || typeof field === "string",
        ),
    )
  );
}

export function readAuctionRealtimeResponse(
  payload: unknown,
): AuctionRealtimeResponse {
  if (
    !isRecord(payload) ||
    payload.success !== true ||
    !isRecord(payload.data)
  ) {
    throw new Error("실시간 매물 응답을 확인할 수 없습니다.");
  }
  const { items, meta } = payload.data;
  if (
    !Array.isArray(items) ||
    !items.every(isAuctionRealtimeItem) ||
    !isRecord(meta) ||
    !Number.isInteger(meta.currentPage) ||
    Number(meta.currentPage) < 1 ||
    !Number.isInteger(meta.pageSize) ||
    Number(meta.pageSize) < 1 ||
    !Number.isInteger(meta.totalPages) ||
    Number(meta.totalPages) < 0 ||
    !Number.isInteger(meta.totalElements) ||
    Number(meta.totalElements) < 0 ||
    typeof meta.isFirst !== "boolean" ||
    typeof meta.isLast !== "boolean"
  ) {
    throw new Error("실시간 매물 응답 형식이 올바르지 않습니다.");
  }
  return payload.data as unknown as AuctionRealtimeResponse;
}
