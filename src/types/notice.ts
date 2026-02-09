export type NoticeType =
  | "POST_LIKE"
  | "POST_COMMENT"
  | "COMMENT_REPLY"
  | "COMMENT_LIKE"
  | "ANNOUNCEMENT"
  | "SYSTEM"
  | "EVENT"
  | "REPORT_RESULT"
  | "POST_BLOCKED"
  | "COMMENT_BLOCKED";

export interface Notice {
  id: number;
  userId: number;
  title: string;
  contents: string;
  url: string;
  createdAt: string; // "yyyy-MM-dd HH:mm:ss" 형식
  isRead: boolean;
  noticeType?: NoticeType;
}

export interface NoticeListParams {
  userId: number;
  day?: number;
}
