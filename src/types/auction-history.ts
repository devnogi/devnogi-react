/**
 * 경매 히스토리 검색 타입 정의
 * 백엔드 API의 Request DTO 구조와 일치하도록 설계
 */

/**
 * 검색 기준 (이상/이하/같음)
 * Backend: SearchStandard enum
 */
export type SearchStandard = "UP" | "DOWN" | "EQUAL";

/**
 * 가격 검색 조건
 * Backend: PriceSearchRequest
 */
export interface PriceSearchRequest {
  priceFrom?: number;
  priceTo?: number;
}

/**
 * 거래 일자 조건
 * Backend: DateAuctionBuyRequest
 */
export interface DateAuctionBuyRequest {
  dateAuctionBuyFrom?: string; // yyyy-MM-dd
  dateAuctionBuyTo?: string; // yyyy-MM-dd
}

/**
 * 밸런스 검색 조건
 * Backend: BalanceSearchRequest
 */
export interface BalanceSearchRequest {
  balance?: number;
  balanceStandard?: SearchStandard;
}

/**
 * 크리티컬 검색 조건
 * Backend: CriticalSearchRequest
 */
export interface CriticalSearchRequest {
  critical?: number;
  criticalStandard?: SearchStandard;
}

/**
 * 방어력 검색 조건
 * Backend: DefenseSearchRequest
 */
export interface DefenseSearchRequest {
  defense?: number;
  defenseStandard?: SearchStandard;
}

/**
 * 에르그 검색 조건 (범위)
 * Backend: ErgSearchRequest
 */
export interface ErgSearchRequest {
  ergFrom?: number;
  ergTo?: number;
}

/**
 * 에르그 등급 검색 조건
 * Backend: ErgRankSearchRequest
 */
export interface ErgRankSearchRequest {
  ergRank?: string;
}

/**
 * 마법 방어력 검색 조건
 * Backend: MagicDefenseSearchRequest
 */
export interface MagicDefenseSearchRequest {
  magicDefense?: number;
  magicDefenseStandard?: SearchStandard;
}

/**
 * 마법 보호 검색 조건
 * Backend: MagicProtectSearchRequest
 */
export interface MagicProtectSearchRequest {
  magicProtect?: number;
  magicProtectStandard?: SearchStandard;
}

/**
 * 최대 공격력 검색 조건
 * Backend: MaxAttackSearchRequest
 */
export interface MaxAttackSearchRequest {
  maxAttackFrom?: number;
  maxAttackTo?: number;
}

/**
 * 최대 내구력 검색 조건
 * Backend: MaximumDurabilitySearchRequest
 */
export interface MaximumDurabilitySearchRequest {
  maximumDurability?: number;
  maximumDurabilityStandard?: SearchStandard;
}

/**
 * 최대 부상률 검색 조건
 * Backend: MaxInjuryRateSearchRequest
 */
export interface MaxInjuryRateSearchRequest {
  maxInjuryRateFrom?: number;
  maxInjuryRateTo?: number;
}

/**
 * 숙련도 검색 조건
 * Backend: ProficiencySearchRequest
 */
export interface ProficiencySearchRequest {
  proficiency?: number;
  proficiencyStandard?: SearchStandard;
}

/**
 * 보호 검색 조건
 * Backend: ProtectSearchRequest
 */
export interface ProtectSearchRequest {
  protect?: number;
  protectStandard?: SearchStandard;
}

/**
 * 남은 거래 횟수 검색 조건
 * Backend: RemainingTransactionCountSearchRequest
 */
export interface RemainingTransactionCountSearchRequest {
  remainingTransactionCount?: number;
  remainingTransactionCountStandard?: SearchStandard;
}

/**
 * 남은 전용 해제 가능 횟수 검색 조건
 * Backend: RemainingUnsealCountSearchRequest
 */
export interface RemainingUnsealCountSearchRequest {
  remainingUnsealCount?: number;
  remainingUnsealCountStandard?: SearchStandard;
}

/**
 * 남은 사용 횟수 검색 조건
 * Backend: RemainingUseCountSearchRequest
 */
export interface RemainingUseCountSearchRequest {
  remainingUseCount?: number;
  remainingUseCountStandard?: SearchStandard;
}

/**
 * 착용 제한 검색 조건
 * Backend: WearingRestrictionsSearchRequest
 */
export interface WearingRestrictionsSearchRequest {
  wearingRestrictions?: string;
}

/**
 * 아이템 옵션 검색 조건 통합
 * Backend: ItemOptionSearchRequest
 */
export interface ItemOptionSearchRequest {
  balanceSearch?: BalanceSearchRequest;
  criticalSearch?: CriticalSearchRequest;
  defenseSearch?: DefenseSearchRequest;
  ergSearch?: ErgSearchRequest;
  ergRankSearch?: ErgRankSearchRequest;
  magicDefenseSearch?: MagicDefenseSearchRequest;
  magicProtectSearch?: MagicProtectSearchRequest;
  maxAttackSearch?: MaxAttackSearchRequest;
  maximumDurabilitySearch?: MaximumDurabilitySearchRequest;
  maxInjuryRateSearch?: MaxInjuryRateSearchRequest;
  proficiencySearch?: ProficiencySearchRequest;
  protectSearch?: ProtectSearchRequest;
  remainingTransactionCountSearch?: RemainingTransactionCountSearchRequest;
  remainingUnsealCountSearch?: RemainingUnsealCountSearchRequest;
  remainingUseCountSearch?: RemainingUseCountSearchRequest;
  wearingRestrictionsSearch?: WearingRestrictionsSearchRequest;
}

/**
 * 경매 거래내역 검색 조건
 * Backend: AuctionHistorySearchRequest
 */
export interface AuctionHistorySearchRequest {
  itemName?: string;
  itemTopCategory?: string;
  itemSubCategory?: string;
  dateAuctionBuyRequest?: DateAuctionBuyRequest;
  priceSearchRequest?: PriceSearchRequest;
  itemOptionSearchRequest?: ItemOptionSearchRequest;
}

/**
 * 경매 히스토리 검색 파라미터 (페이지네이션 포함)
 * Backend: PageRequestDto + AuctionHistorySearchRequest
 */
export interface AuctionHistorySearchParams extends AuctionHistorySearchRequest {
  // 페이지네이션
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "asc" | "desc";
}
