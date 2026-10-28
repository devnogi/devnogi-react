// 게시판 타입
export interface Board {
  id: number;
  name: string;
  description: string;
  topCategory: string;
  subCategory: string;
}

// 공통 API 응답 래퍼
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

// 게시판 목록 데이터
export interface BoardListData {
  count: number;
  boards: Board[];
}

// 백엔드 댓글 응답 아이템 타입
export interface CommentPageResponseItem {
  id: number;
  userId: number;
  nickname: string;
  parentComment: number | null;
  content: string;
  likeCount: number;
  isDeleted: boolean;
  isBlocked: boolean;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
  verified?: boolean;
}

// 페이지 메타 정보
interface PageMeta {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  isFirst: boolean;
  isLast: boolean;
}

// 백엔드 댓글 목록 응답 타입
export interface BackendCommentsResponse {
  items: CommentPageResponseItem[];
  meta: PageMeta;
}
