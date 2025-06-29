'use client';

import { useState, useCallback, useMemo } from 'react';
import { Post, PostCategory, PostSortOption, PostListFilters } from '@/types/post';
import { getMockPosts } from '@/data/mock-posts';

interface UsePostsOptions {
  initialCategory?: PostCategory;
  initialSort?: PostSortOption;
  initialPage?: number;
  limit?: number;
}

export const usePosts = (options: UsePostsOptions = {}) => {
  const {
    initialCategory = '전체',
    initialSort = 'latest',
    initialPage = 1,
    limit = 20,
  } = options;

  const [filters, setFilters] = useState<PostListFilters>({
    category: initialCategory,
    sort: initialSort,
    ratingCut: undefined,
    isBestOnly: false,
    page: initialPage,
    limit,
  });

  // 게시글 데이터 가져오기
  const { posts, totalCount, currentPage, totalPages } = useMemo(() => {
    return getMockPosts({
      category: filters.category,
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort,
      isBestOnly: filters.isBestOnly,
    });
  }, [filters]);

  // 카테고리 변경
  const setCategory = useCallback((category: PostCategory) => {
    setFilters(prev => ({
      ...prev,
      category,
      page: 1, // 카테고리 변경 시 첫 페이지로 이동
    }));
  }, []);

  // 정렬 변경
  const setSort = useCallback((sort: PostSortOption) => {
    setFilters(prev => ({
      ...prev,
      sort,
      page: 1, // 정렬 변경 시 첫 페이지로 이동
    }));
  }, []);

  // 추천컷 변경
  const setRatingCut = useCallback((ratingCut?: number) => {
    setFilters(prev => ({
      ...prev,
      ratingCut,
      page: 1,
    }));
  }, []);

  // 개념글만 토글
  const toggleBestOnly = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      isBestOnly: !prev.isBestOnly,
      page: 1,
    }));
  }, []);

  // 페이지 변경
  const setPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setFilters(prev => ({
        ...prev,
        page,
      }));
    }
  }, [totalPages]);

  // 다음 페이지
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setPage(currentPage + 1);
    }
  }, [currentPage, totalPages, setPage]);

  // 이전 페이지
  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setPage(currentPage - 1);
    }
  }, [currentPage, setPage]);

  // 필터 초기화
  const resetFilters = useCallback(() => {
    setFilters({
      category: '전체',
      sort: 'latest',
      ratingCut: undefined,
      isBestOnly: false,
      page: 1,
      limit,
    });
  }, [limit]);

  // 페이지네이션 정보
  const paginationInfo = useMemo(() => ({
    currentPage,
    totalPages,
    totalCount,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    startIndex: (currentPage - 1) * limit + 1,
    endIndex: Math.min(currentPage * limit, totalCount),
  }), [currentPage, totalPages, totalCount, limit]);

  return {
    // 데이터
    posts,
    totalCount,
    
    // 필터 상태
    filters,
    
    // 필터 변경 함수들
    setCategory,
    setSort,
    setRatingCut,
    toggleBestOnly,
    
    // 페이지네이션
    setPage,
    nextPage,
    prevPage,
    paginationInfo,
    
    // 기타
    resetFilters,
  };
}; 