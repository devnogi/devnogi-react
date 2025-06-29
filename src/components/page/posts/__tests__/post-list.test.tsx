import { render, screen } from '@testing-library/react';
import { PostList } from '../post-list';

// Mock the hooks and data
jest.mock('@/hooks/use-posts', () => ({
  usePosts: () => ({
    posts: [
      {
        id: 1,
        title: '테스트 게시글',
        author: {
          nickname: '테스트유저',
          isManager: false,
          isFixed: false,
        },
        createdAt: '2025-06-29T14:19:52.000Z',
        viewCount: 100,
        likeCount: 10,
        commentCount: 5,
        category: '전체',
        isNotice: false,
      },
    ],
    totalCount: 1,
    filters: {
      category: '전체',
      sort: 'latest',
      ratingCut: undefined,
      isBestOnly: false,
      page: 1,
      limit: 20,
    },
    setCategory: jest.fn(),
    setSort: jest.fn(),
    setRatingCut: jest.fn(),
    toggleBestOnly: jest.fn(),
    setPage: jest.fn(),
    nextPage: jest.fn(),
    prevPage: jest.fn(),
    paginationInfo: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 1,
      hasNextPage: false,
      hasPrevPage: false,
      startIndex: 1,
      endIndex: 1,
    },
  }),
}));

jest.mock('@/data/mock-posts', () => ({
  mockChannelInfo: {
    name: '테스트 채널',
    description: '테스트 채널 설명',
    icon: '/test-icon.png',
    subscriberCount: 1000,
    notificationCount: 100,
    manager: {
      nickname: '매니저',
      isManager: true,
    },
  },
}));

describe('PostList', () => {
  it('renders channel header', () => {
    render(<PostList />);
    expect(screen.getByText('테스트 채널')).toBeInTheDocument();
    expect(screen.getByText('테스트 채널 설명')).toBeInTheDocument();
  });

  it('renders post list', () => {
    render(<PostList />);
    const postTitles = screen.getAllByText('테스트 게시글');
    expect(postTitles.length).toBeGreaterThan(0);
    expect(screen.getByText('테스트유저')).toBeInTheDocument();
  });

  it('renders pagination info', () => {
    render(<PostList />);
    expect(screen.getByText('전체 1개 중 1-1개')).toBeInTheDocument();
  });
}); 