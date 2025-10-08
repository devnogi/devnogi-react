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

// 사용자 타입
export interface Author {
  id: number;
  username: string;
  nickname: string;
  profileImage?: string;
}

// 게시글 타입
export interface Post {
  id: number;
  boardId: number;
  boardName: string;
  title: string;
  content: string;
  author: Author;
  images?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
}

// 게시글 목록 응답 타입
export interface PostsResponse {
  posts: Post[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
}

// 게시글 상세 타입 (목록과 동일하지만 명시적 구분)
export type PostDetail = Post;

// 댓글 타입
export interface Comment {
  id: number;
  postId: number;
  parentCommentId: number | null;
  content: string;
  author: Author;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  isLiked?: boolean;
  replies?: Comment[];
}

// 댓글 목록 응답 타입
export interface CommentsResponse {
  comments: Comment[];
  totalCount: number;
}

// 게시글 작성/수정 요청 타입
export interface PostFormData {
  boardId: number;
  title: string;
  content: string;
  images?: string[];
  tags?: string[];
}

// 댓글 작성 요청 타입
export interface CommentFormData {
  content: string;
  parentCommentId?: number;
}

// 정렬 옵션
export type SortOption = "latest" | "popular" | "comments" | "views";

// 게시글 목록 쿼리 파라미터
export interface PostsQueryParams {
  boardId?: number;
  page?: number;
  size?: number;
  sort?: SortOption;
  search?: string;
}
