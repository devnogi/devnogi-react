import { Post, ChannelInfo } from '@/types/post';

export const mockChannelInfo: ChannelInfo = {
  name: '게시판1',
  description: '테스트 게시판입니다.',
  icon: '/api/placeholder/64/64',
  subscriberCount: 3562,
  notificationCount: 340,
  manager: {
    nickname: '운영자',
    isManager: true,
  },
};

export const mockPosts: Post[] = [
  // 공지사항들
  {
    id: 1,
    title: '[공지] 게시판 이용 안내',
    author: {
      nickname: '운영자',
      isManager: true,
      isFixed: true,
    },
    createdAt: '2025-02-19T10:28:38.000Z',
    viewCount: 18510,
    likeCount: 0,
    commentCount: 0,
    category: '공지',
    isNotice: true,
  },
  {
    id: 2,
    title: '[공지] 이벤트 안내',
    author: {
      nickname: '운영자',
      isManager: true,
      isFixed: true,
    },
    createdAt: '2025-01-02T10:57:58.000Z',
    viewCount: 26468,
    likeCount: 0,
    commentCount: 0,
    category: '공지',
    isNotice: true,
  },
  {
    id: 3,
    title: '[공지] 게시판 규칙',
    author: {
      nickname: '운영자',
      isManager: true,
      isFixed: false,
    },
    createdAt: '2024-11-21T14:25:22.000Z',
    viewCount: 61316,
    likeCount: 0,
    commentCount: 0,
    category: '공지',
    isNotice: true,
  },
  {
    id: 4,
    title: '[공지] 자주 묻는 질문',
    author: {
      nickname: '운영자',
      isManager: false,
      isFixed: true,
    },
    createdAt: '2022-08-26T11:07:34.000Z',
    viewCount: 91731,
    likeCount: 0,
    commentCount: 0,
    category: '공지',
    isNotice: true,
  },
  {
    id: 5,
    title: '[공지] 필독 공지',
    author: {
      nickname: '운영자',
      isManager: false,
      isFixed: true,
    },
    createdAt: '2023-06-26T12:42:48.000Z',
    viewCount: 98428,
    likeCount: 0,
    commentCount: 0,
    category: '공지',
    isNotice: true,
    isFiltered: true,
  },
  {
    id: 6,
    title: '[공지] 신고 안내',
    author: {
      nickname: '운영자',
      isManager: true,
      isFixed: false,
    },
    createdAt: '2024-10-19T09:14:04.000Z',
    viewCount: 31299,
    likeCount: 0,
    commentCount: 0,
    category: '공지',
    isNotice: true,
    isFiltered: true,
  },

  // 일반 게시글들
  {
    id: 7,
    title: '게시글1',
    author: {
      nickname: '유저1',
      isManager: false,
      isFixed: false,
    },
    createdAt: '2025-06-29T14:19:52.000Z',
    viewCount: 5,
    likeCount: 0,
    commentCount: 0,
    category: '전체',
    isNotice: false,
  },
  {
    id: 8,
    title: '게시글2',
    author: {
      nickname: '유저2',
      isManager: false,
      isFixed: true,
    },
    createdAt: '2025-06-29T14:18:39.000Z',
    viewCount: 19,
    likeCount: 1,
    commentCount: 2,
    category: '전체',
    isNotice: false,
  },
  {
    id: 9,
    title: '게시글3',
    author: {
      nickname: '유저3',
      isManager: false,
      isFixed: false,
    },
    createdAt: '2025-06-29T14:15:20.000Z',
    viewCount: 45,
    likeCount: 8,
    commentCount: 3,
    category: '질문',
    isNotice: false,
  },
  {
    id: 10,
    title: '게시글4',
    author: {
      nickname: '유저4',
      isManager: false,
      isFixed: false,
    },
    createdAt: '2025-06-29T14:10:15.000Z',
    viewCount: 156,
    likeCount: 23,
    commentCount: 7,
    category: '창작',
    isNotice: false,
    hasMedia: true,
  },
  {
    id: 11,
    title: '게시글5',
    author: {
      nickname: '유저5',
      isManager: false,
      isFixed: false,
    },
    createdAt: '2025-06-29T14:05:30.000Z',
    viewCount: 89,
    likeCount: 2,
    commentCount: 12,
    category: '도움요청',
    isNotice: false,
  },
  {
    id: 12,
    title: '게시글6',
    author: {
      nickname: '유저6',
      isManager: false,
      isFixed: false,
    },
    createdAt: '2025-06-29T14:00:45.000Z',
    viewCount: 234,
    likeCount: 15,
    commentCount: 5,
    category: '나눔&대여',
    isNotice: false,
  },
  {
    id: 13,
    title: '게시글7',
    author: {
      nickname: '유저7',
      isManager: false,
      isFixed: false,
    },
    createdAt: '2025-06-29T13:55:10.000Z',
    viewCount: 567,
    likeCount: 89,
    commentCount: 23,
    category: '대회',
    isNotice: false,
  },
  {
    id: 14,
    title: '게시글8',
    author: {
      nickname: '유저8',
      isManager: false,
      isFixed: false,
    },
    createdAt: '2025-06-29T13:50:25.000Z',
    viewCount: 123,
    likeCount: 34,
    commentCount: 8,
    category: '악보',
    isNotice: false,
  },
  {
    id: 15,
    title: '게시글9',
    author: {
      nickname: '유저9',
      isManager: false,
      isFixed: false,
    },
    createdAt: '2025-06-29T13:45:40.000Z',
    viewCount: 345,
    likeCount: 67,
    commentCount: 15,
    category: '의장',
    isNotice: false,
    hasMedia: true,
  },
  {
    id: 16,
    title: '게시글10',
    author: {
      nickname: '유저10',
      isManager: false,
      isFixed: false,
    },
    createdAt: '2025-06-29T13:40:55.000Z',
    viewCount: 789,
    likeCount: 45,
    commentCount: 67,
    category: '토론',
    isNotice: false,
  },
  {
    id: 17,
    title: '게시글11',
    author: {
      nickname: '유저11',
      isManager: false,
      isFixed: false,
    },
    createdAt: '2025-06-29T13:35:20.000Z',
    viewCount: 456,
    likeCount: 78,
    commentCount: 12,
    category: '자랑',
    isNotice: false,
    hasMedia: true,
  },
  {
    id: 18,
    title: '게시글12',
    author: {
      nickname: '유저12',
      isManager: false,
      isFixed: false,
    },
    createdAt: '2025-06-29T13:30:35.000Z',
    viewCount: 234,
    likeCount: 23,
    commentCount: 9,
    category: '연재',
    isNotice: false,
  },
  {
    id: 19,
    title: '게시글13',
    author: {
      nickname: '유저13',
      isManager: false,
      isFixed: false,
    },
    createdAt: '2025-06-29T13:25:50.000Z',
    viewCount: 123,
    likeCount: 12,
    commentCount: 4,
    category: '건의',
    isNotice: false,
  },
  {
    id: 20,
    title: '게시글14',
    author: {
      nickname: '유저14',
      isManager: false,
      isFixed: false,
    },
    createdAt: '2025-06-29T13:20:15.000Z',
    viewCount: 345,
    likeCount: 56,
    commentCount: 18,
    category: '기부',
    isNotice: false,
  },
  {
    id: 21,
    title: '게시글15',
    author: {
      nickname: '유저15',
      isManager: false,
      isFixed: false,
    },
    createdAt: '2025-06-29T13:15:30.000Z',
    viewCount: 678,
    likeCount: 34,
    commentCount: 25,
    category: '유출',
    isNotice: false,
  },
];

export const getMockPosts = (filters: {
  category?: string;
  page?: number;
  limit?: number;
  sort?: string;
  isBestOnly?: boolean;
}): { posts: Post[]; totalCount: number; currentPage: number; totalPages: number } => {
  let filteredPosts = [...mockPosts];
  
  // 카테고리 필터링
  if (filters.category && filters.category !== '전체') {
    filteredPosts = filteredPosts.filter(post => post.category === filters.category);
  }
  
  // 개념글만 필터링
  if (filters.isBestOnly) {
    filteredPosts = filteredPosts.filter(post => post.isBest);
  }
  
  // 정렬
  if (filters.sort) {
    switch (filters.sort) {
      case 'rating':
        filteredPosts.sort((a, b) => b.likeCount - a.likeCount);
        break;
      case 'commentCount':
        filteredPosts.sort((a, b) => b.commentCount - a.commentCount);
        break;
      case 'latest':
      default:
        filteredPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
  }
  
  const totalCount = filteredPosts.length;
  const currentPage = filters.page || 1;
  const limit = filters.limit || 20;
  const totalPages = Math.ceil(totalCount / limit);
  
  // 페이지네이션
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
  
  return {
    posts: paginatedPosts,
    totalCount,
    currentPage,
    totalPages,
  };
}; 