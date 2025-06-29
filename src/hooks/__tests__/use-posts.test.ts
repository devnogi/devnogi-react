import { renderHook, act } from '@testing-library/react';
import { usePosts } from '../use-posts';

// Mock the mock data
jest.mock('@/data/mock-posts', () => ({
  getMockPosts: jest.fn((filters) => ({
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
    currentPage: filters.page || 1,
    totalPages: 1,
  })),
}));

describe('usePosts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => usePosts());

    expect(result.current.filters.category).toBe('전체');
    expect(result.current.filters.sort).toBe('latest');
    expect(result.current.filters.page).toBe(1);
    expect(result.current.filters.isBestOnly).toBe(false);
    expect(result.current.posts).toHaveLength(1);
    expect(result.current.totalCount).toBe(1);
  });

  it('changes category correctly', () => {
    const { result } = renderHook(() => usePosts());

    act(() => {
      result.current.setCategory('질문');
    });

    expect(result.current.filters.category).toBe('질문');
    expect(result.current.filters.page).toBe(1); // 페이지가 1로 리셋되는지 확인
  });

  it('changes sort correctly', () => {
    const { result } = renderHook(() => usePosts());

    act(() => {
      result.current.setSort('rating');
    });

    expect(result.current.filters.sort).toBe('rating');
    expect(result.current.filters.page).toBe(1); // 페이지가 1로 리셋되는지 확인
  });

  it('toggles best only correctly', () => {
    const { result } = renderHook(() => usePosts());

    expect(result.current.filters.isBestOnly).toBe(false);

    act(() => {
      result.current.toggleBestOnly();
    });

    expect(result.current.filters.isBestOnly).toBe(true);
    expect(result.current.filters.page).toBe(1); // 페이지가 1로 리셋되는지 확인
  });

  it('provides correct pagination info', () => {
    const { result } = renderHook(() => usePosts());

    expect(result.current.paginationInfo.currentPage).toBe(1);
    expect(result.current.paginationInfo.totalPages).toBe(1);
    expect(result.current.paginationInfo.totalCount).toBe(1);
    expect(result.current.paginationInfo.hasNextPage).toBe(false);
    expect(result.current.paginationInfo.hasPrevPage).toBe(false);
  });
}); 