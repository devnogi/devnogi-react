'use client';

import { usePosts } from '@/hooks/use-posts';
import { PostListHeader } from './post-list-header';
import { PostListFilters } from './post-list-filters';
import { PostListTable } from './post-list-table';
import { PostListPagination } from './post-list-pagination';
import { mockChannelInfo } from '@/data/mock-posts';
import { cn } from '@/lib/utils';

interface PostListProps {
  className?: string;
}

export const PostList = ({ className }: PostListProps) => {
  const {
    posts,
    totalCount,
    filters,
    setCategory,
    setSort,
    setRatingCut,
    toggleBestOnly,
    setPage,
    nextPage,
    prevPage,
    paginationInfo,
  } = usePosts();

  return (
    <div className={cn('space-y-6', className)}>
      {/* 채널 헤더 */}
      <PostListHeader channelInfo={mockChannelInfo} />

      {/* 필터 */}
      <PostListFilters
        category={filters.category}
        sort={filters.sort}
        ratingCut={filters.ratingCut}
        isBestOnly={filters.isBestOnly}
        onCategoryChange={setCategory}
        onSortChange={setSort}
        onRatingCutChange={setRatingCut}
        onBestOnlyToggle={toggleBestOnly}
      />

      {/* 게시글 목록 */}
      <PostListTable posts={posts} />

      {/* 페이지네이션 */}
      {totalCount > 0 && (
        <PostListPagination
          currentPage={paginationInfo.currentPage}
          totalPages={paginationInfo.totalPages}
          totalCount={paginationInfo.totalCount}
          startIndex={paginationInfo.startIndex}
          endIndex={paginationInfo.endIndex}
          onPageChange={setPage}
          onPrevPage={prevPage}
          onNextPage={nextPage}
        />
      )}
    </div>
  );
}; 