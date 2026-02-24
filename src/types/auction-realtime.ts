/**
 * 실시간 경매장 검색 타입 정의
 * 백엔드 API의 Request DTO 구조와 일치하도록 설계
 * auction-history.ts와 유사하지만 날짜 필터(dateAuctionBuyRequest)가 없음
 */

import {
  SearchStandard,
  PriceSearchRequest,
  ItemOptionSearchRequest,
  EnchantSearchRequest,
  MetalwareSearchRequest,
} from "./auction-history";

// Re-export shared types
export type {
  SearchStandard,
  PriceSearchRequest,
  ItemOptionSearchRequest,
  EnchantSearchRequest,
  MetalwareSearchRequest,
};

/**
 * 실시간 경매장 검색 조건
 * Backend: AuctionRealtimeSearchRequest
 * 거래내역과 달리 날짜 필터(dateAuctionBuyRequest)가 없음
 */
export interface AuctionRealtimeSearchRequest {
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
export interface AuctionRealtimeSearchParams extends AuctionRealtimeSearchRequest {
  // 페이지네이션
  page?: number;
  size?: number;
  sortBy?: string; // dateAuctionExpire, dateAuctionRegister, auctionPricePerUnit, itemName
  direction?: "asc" | "desc";
}
