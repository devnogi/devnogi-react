'use client';

import { Post } from '@/types/post';
import { cn } from '@/lib/utils';
import { Image, MessageSquare, Eye, ThumbsUp } from 'lucide-react';

interface PostListRowProps {
  post: Post;
  className?: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } else {
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  }
};

const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '만';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + '천';
  }
  return num.toString();
};

export const PostListRow = ({ post, className }: PostListRowProps) => {
  const isNotice = post.isNotice;
  const isFiltered = post.isFiltered;

  return (
    <div
      className={cn(
        'group relative border-b border-gray-100 hover:bg-gray-50 transition-colors',
        isNotice && 'bg-blue-50 hover:bg-blue-100',
        isFiltered && 'opacity-60',
        className
      )}
    >
      <div className="flex items-center p-4">
        {/* 데스크톱 레이아웃 */}
        <div className="hidden md:flex flex-1 items-center gap-4">
          {/* 번호 */}
          <div className="w-16 flex-shrink-0">
            <span className={cn(
              'text-sm font-medium',
              isNotice ? 'text-blue-600 font-bold' : 'text-gray-500'
            )}>
              {isNotice ? '공지' : post.id}
            </span>
          </div>

          {/* 제목 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {/* 미디어 아이콘 */}
              {post.hasMedia && (
                <Image className="h-4 w-4 text-gray-400 flex-shrink-0" />
              )}
              
              {/* 제목 */}
              <h3 className={cn(
                'text-sm font-medium truncate',
                isNotice ? 'text-blue-900 font-bold' : 'text-gray-900'
              )}>
                {post.title}
              </h3>

              {/* 댓글 수 */}
              {post.commentCount > 0 && (
                <span className="text-xs text-gray-500 flex-shrink-0">
                  [{post.commentCount}]
                </span>
              )}
            </div>
          </div>

          {/* 작성자 */}
          <div className="w-32 flex-shrink-0">
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-700 truncate">
                {post.author.nickname}
              </span>
              {post.author.isManager && (
                <span className="text-blue-600 text-xs" title="매니저">👑</span>
              )}
              {post.author.isFixed && (
                <span className="text-green-600 text-xs" title="고정닉">✓</span>
              )}
            </div>
          </div>

          {/* 작성일 */}
          <div className="w-24 flex-shrink-0">
            <span className="text-sm text-gray-500">
              {formatDate(post.createdAt)}
            </span>
          </div>

          {/* 조회수 */}
          <div className="w-16 flex-shrink-0">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3 text-gray-400" />
              <span className="text-sm text-gray-500">
                {formatNumber(post.viewCount)}
              </span>
            </div>
          </div>

          {/* 추천수 */}
          <div className="w-16 flex-shrink-0">
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3 text-gray-400" />
              <span className="text-sm text-gray-500">
                {formatNumber(post.likeCount)}
              </span>
            </div>
          </div>
        </div>

        {/* 모바일 레이아웃 */}
        <div className="md:hidden flex-1 min-w-0">
          <div className="flex items-start gap-3">
            {/* 번호 */}
            <div className="flex-shrink-0">
              <span className={cn(
                'text-xs font-medium',
                isNotice ? 'text-blue-600 font-bold' : 'text-gray-500'
              )}>
                {isNotice ? '공지' : post.id}
              </span>
            </div>

            {/* 제목과 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-1">
                {/* 미디어 아이콘 */}
                {post.hasMedia && (
                  <Image className="h-3 w-3 text-gray-400 flex-shrink-0 mt-0.5" />
                )}
                
                {/* 제목 */}
                <h3 className={cn(
                  'text-sm font-medium line-clamp-2',
                  isNotice ? 'text-blue-900 font-bold' : 'text-gray-900'
                )}>
                  {post.title}
                </h3>

                {/* 댓글 수 */}
                {post.commentCount > 0 && (
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    [{post.commentCount}]
                  </span>
                )}
              </div>

              {/* 작성자, 날짜, 조회수 */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  {post.author.nickname}
                  {post.author.isManager && (
                    <span className="text-blue-600">👑</span>
                  )}
                  {post.author.isFixed && (
                    <span className="text-green-600">✓</span>
                  )}
                </span>
                <span>{formatDate(post.createdAt)}</span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {formatNumber(post.viewCount)}
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  {formatNumber(post.likeCount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 