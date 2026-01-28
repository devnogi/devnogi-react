// 뿔피리 히스토리 아이템
export interface HornBugleItem {
  id: number;
  serverName: string;
  characterName: string;
  message: string;
  dateSend: string;
  dateRegister: string;
}

// 페이지 메타 정보
export interface HornBuglePageMeta {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  isFirst: boolean;
  isLast: boolean;
}

// API 응답
export interface HornBugleResponse {
  items: HornBugleItem[];
  meta: HornBuglePageMeta;
}

// 검색 파라미터
export interface HornBugleSearchParams {
  serverName?: string;
  keyword?: string;
  page?: number;
  size?: number;
}

// 서버 목록
export const HORN_BUGLE_SERVERS = ["류트", "만돌린", "하프", "울프"] as const;
export type HornBugleServer = (typeof HORN_BUGLE_SERVERS)[number];
