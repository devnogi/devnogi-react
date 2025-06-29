export interface Post {
  id: number;
  title: string;
  author: {
    nickname: string;
    isManager: boolean;
    isFixed: boolean;
    icon?: string;
  };
  createdAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  category: PostCategory;
  isNotice: boolean;
  isBest?: boolean;
  hasMedia?: boolean;
  isFiltered?: boolean;
}

export type PostCategory = 
  | '전체'
  | '공지'
  | '질문'
  | '공식'
  | '도움요청'
  | '나눔&대여'
  | '나눔인증'
  | '연재'
  | '토론'
  | '유출'
  | '자랑'
  | '창작'
  | '악보'
  | '의장'
  | '대회'
  | '건의'
  | '저격'
  | '기부'
  | '운영용';

export type PostSortOption = 
  | 'latest'      // 등록순
  | 'rating'      // 추천순 (24시간)
  | 'rating72'    // 추천순 (3일)
  | 'ratingAll'   // 추천순 (전체)
  | 'commentCount' // 댓글갯수순 (3일)
  | 'recentComment'; // 최근댓글순

export interface PostListFilters {
  category: PostCategory;
  sort: PostSortOption;
  ratingCut?: number;
  isBestOnly: boolean;
  page: number;
  limit: number;
}

export interface PostListResponse {
  posts: Post[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ChannelInfo {
  name: string;
  description: string;
  icon: string;
  subscriberCount: number;
  notificationCount: number;
  manager: {
    nickname: string;
    isManager: boolean;
  };
} 