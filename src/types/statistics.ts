/**
 * 통계 API 타입 정의
 * Backend: open-api-batch-server statistics 모듈
 */

/**
 * 통계 API 공통 응답 래퍼
 */
export interface StatisticsApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

/**
 * 공통 통계 데이터 필드
 */
export interface StatisticsBase {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  totalVolume: number;
  totalQuantity: number;
}

/**
 * 아이템 일간 통계 응답
 * Backend: ItemDailyStatisticsResponse
 */
export interface ItemDailyStatistics extends StatisticsBase {
  itemName: string;
  itemTopCategory: string;
  itemSubCategory: string;
  date: string; // yyyy-MM-dd
}

/**
 * 아이템 주간 통계 응답
 * Backend: ItemWeeklyStatisticsResponse
 */
export interface ItemWeeklyStatistics extends StatisticsBase {
  itemName: string;
  itemTopCategory: string;
  itemSubCategory: string;
  weekStart: string; // yyyy-MM-dd
  weekEnd: string; // yyyy-MM-dd
}

/**
 * 서브카테고리 일간 통계 응답
 * Backend: SubcategoryDailyStatisticsResponse
 */
export interface SubcategoryDailyStatistics extends StatisticsBase {
  topCategory: string;
  subCategory: string;
  date: string; // yyyy-MM-dd
}

/**
 * 서브카테고리 주간 통계 응답
 * Backend: SubcategoryWeeklyStatisticsResponse
 */
export interface SubcategoryWeeklyStatistics extends StatisticsBase {
  topCategory: string;
  subCategory: string;
  weekStart: string; // yyyy-MM-dd
  weekEnd: string; // yyyy-MM-dd
}

/**
 * 탑카테고리 일간 통계 응답
 * Backend: TopCategoryDailyStatisticsResponse
 */
export interface TopCategoryDailyStatistics extends StatisticsBase {
  topCategory: string;
  date: string; // yyyy-MM-dd
}

/**
 * 탑카테고리 주간 통계 응답
 * Backend: TopCategoryWeeklyStatisticsResponse
 */
export interface TopCategoryWeeklyStatistics extends StatisticsBase {
  topCategory: string;
  weekStart: string; // yyyy-MM-dd
  weekEnd: string; // yyyy-MM-dd
}

/**
 * 아이템 통계 검색 파라미터
 */
export interface ItemStatisticsParams {
  itemName: string;
  subCategory: string;
  topCategory: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * 서브카테고리 통계 검색 파라미터
 */
export interface SubcategoryStatisticsParams {
  topCategory: string;
  subCategory: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * 탑카테고리 통계 검색 파라미터
 */
export interface TopCategoryStatisticsParams {
  topCategory: string;
  dateFrom?: string;
  dateTo?: string;
}
