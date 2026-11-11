import type { ActivityGrade } from "@/types/experience";
import type { GameProfile } from "@/types/profile";

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

export type FeedTab = "latest" | "popular" | "bookmarks" | "mine";
type PostMediaKind = "IMAGE" | "VIDEO";

interface PostAuthor {
  nickname: string;
  profileImageUrl: string | null;
  serverName: string | null;
  verified: boolean;
  activityGrade?: ActivityGrade | null;
  arcana?: GameProfile["arcana"];
}

interface PostMedia {
  id: number;
  kind: PostMediaKind;
  url: string;
  contentType: string;
  displayOrder: number;
}

export interface PostFeedItem {
  id: number;
  userId: number;
  author: PostAuthor;
  content: string;
  media: PostMedia[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  liked: boolean;
  bookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PageMeta {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  isFirst: boolean;
  isLast: boolean;
}

export interface CommentPageResponseItem {
  id: number;
  userId: number;
  nickname?: string;
  username?: string;
  profileImageUrl?: string | null;
  serverName?: string | null;
  parentComment: number | null;
  content: string;
  likeCount: number;
  isDeleted: boolean;
  isBlocked: boolean;
  isLiked: boolean;
  createdAt?: string;
  updatedAt?: string;
  verified?: boolean;
  activityGrade?: ActivityGrade | null;
  arcana?: GameProfile["arcana"];
}

export interface BackendCommentsResponse {
  items: CommentPageResponseItem[];
  meta: PageMeta;
}

export interface CommentThreadResponseItem {
  comment: CommentPageResponseItem;
  replies: CommentPageResponseItem[];
  replyCount: number;
}

export interface CommentThreadsResponse {
  items: CommentThreadResponseItem[];
  meta: PageMeta;
}
