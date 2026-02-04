/**
 * 랭킹 API 타입 정의
 * Backend: open-api-batch-server ranking 모듈
 */

/**
 * 거래량 랭킹 응답
 * Backend: VolumeRankingResponse
 */
export interface VolumeRankingResponse {
  rank: number;
  itemName: string;
  itemTopCategory: string;
  itemSubCategory: string;
  totalQuantity: number;
  totalVolume: number;
  avgPrice: number;
  dateAuctionBuy: string; // yyyy-MM-dd
}

/**
 * 가격 랭킹 응답
 * Backend: PriceRankingResponse
 */
export interface PriceRankingResponse {
  rank: number;
  itemName: string;
  itemTopCategory: string;
  itemSubCategory: string;
  maxPrice: number;
  avgPrice: number;
  totalVolume: number;
  totalQuantity: number;
  dateAuctionBuy: string; // yyyy-MM-dd
}

/**
 * 가격 변동 랭킹 응답
 * Backend: PriceChangeRankingResponse
 */
export interface PriceChangeRankingResponse {
  rank: number;
  itemName: string;
  itemTopCategory: string;
  itemSubCategory: string;
  todayAvgPrice: number;
  yesterdayAvgPrice: number;
  changeRate: number; // 변동률 (%)
  priceChange: number; // 변동액
}

/**
 * 거래량 변동 랭킹 응답
 * Backend: VolumeChangeRankingResponse
 */
export interface VolumeChangeRankingResponse {
  rank: number;
  itemName: string;
  itemTopCategory: string;
  itemSubCategory: string;
  todayQuantity: number;
  yesterdayQuantity: number;
  changeRate: number; // 변동률 (%)
  quantityChange: number; // 변동량
}

/**
 * 역대 기록 랭킹 응답
 * Backend: AllTimeRankingResponse
 */
export interface AllTimeRankingResponse {
  rank: number;
  itemName: string;
  itemDisplayName: string;
  itemTopCategory: string;
  itemSubCategory: string;
  auctionPricePerUnit: number;
  itemCount: number;
  totalPrice: number;
  dateAuctionBuy: string; // ISO 8601 (yyyy-MM-dd'T'HH:mm:ss'Z')
}

/**
 * 랭킹 검색 요청 파라미터
 * Backend: RankingSearchRequest
 */
export interface RankingSearchRequest {
  limit?: number; // 기본값 100
}

/**
 * 카테고리별 랭킹 검색 요청 파라미터
 * Backend: CategoryRankingSearchRequest
 */
export interface CategoryRankingSearchRequest extends RankingSearchRequest {
  topCategory: string;
  subCategory?: string;
}

/**
 * API 응답 래퍼
 */
export interface RankingApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}
