'use client';

import { Post } from '@/types/post';
import { PostListRow } from './post-list-row';
import { cn } from '@/lib/utils';

interface PostListTableProps {
  posts: Post[];
  className?: string;
}

export const PostListTable = ({ posts, className }: PostListTableProps) => {
  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg overflow-hidden', className)}>
      {/* 테이블 헤더 (데스크톱만) */}
      <div className="hidden md:block bg-gray-50 border-b border-gray-200">
        <div className="flex items-center p-4 gap-4">
          <div className="w-16 flex-shrink-0">
            <span className="text-sm font-medium text-gray-700">번호</span>
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-700">제목</span>
          </div>
          <div className="w-32 flex-shrink-0">
            <span className="text-sm font-medium text-gray-700">작성자</span>
          </div>
          <div className="w-24 flex-shrink-0">
            <span className="text-sm font-medium text-gray-700">작성일</span>
          </div>
          <div className="w-16 flex-shrink-0">
            <span className="text-sm font-medium text-gray-700">조회수</span>
          </div>
          <div className="w-16 flex-shrink-0">
            <span className="text-sm font-medium text-gray-700">추천</span>
          </div>
        </div>
      </div>

      {/* 게시글 목록 */}
      <div className="divide-y divide-gray-100">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            게시글이 없습니다.
          </div>
        ) : (
          posts.map((post) => (
            <PostListRow key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
}; 