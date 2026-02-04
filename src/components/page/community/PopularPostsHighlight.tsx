"use client";

import { Flame, Heart, Eye, MessageCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { usePopularPosts } from "@/hooks/usePopularPosts";

interface PopularPostsHighlightProps {
  boardId?: number;
}

export default function PopularPostsHighlight({ boardId }: PopularPostsHighlightProps) {
  const { data: posts, isLoading, isError } = usePopularPosts({ boardId, limit: 5 });

  if (isLoading) {
    return <PopularPostsSkeleton />;
  }

  if (isError || !posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/30 dark:via-amber-950/30 dark:to-yellow-950/30 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-orange-100 dark:border-orange-900/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-md sm:rounded-lg">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <h2 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
            인기글
          </h2>
        </div>
        <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
          TOP 5
        </span>
      </div>

      {/* Post List */}
      <div className="space-y-1.5 sm:space-y-2">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            href={`/community/${post.id}`}
            className="group flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white/70 dark:bg-navy-800/50 rounded-lg sm:rounded-xl hover:bg-white dark:hover:bg-navy-700 transition-all duration-200 hover:shadow-md"
          >
            {/* Rank Badge */}
            <div
              className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm ${
                index === 0
                  ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
                  : index === 1
                    ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white"
                    : index === 2
                      ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white"
                      : "bg-gray-100 dark:bg-navy-700 text-gray-500 dark:text-gray-400"
              }`}
            >
              {index + 1}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                {post.title}
              </h3>
              <div className="flex items-center flex-wrap gap-x-2 sm:gap-x-3 gap-y-0.5 mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-0.5 sm:gap-1">
                  <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400" />
                  {post.likeCount.toLocaleString()}
                </span>
                <span className="flex items-center gap-0.5 sm:gap-1">
                  <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {post.viewCount.toLocaleString()}
                </span>
                <span className="flex items-center gap-0.5 sm:gap-1">
                  <MessageCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {post.commentCount.toLocaleString()}
                </span>
                <span className="hidden sm:inline">
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
              </div>
            </div>

            {/* Arrow - 모바일에서 숨김 */}
            <ChevronRight className="hidden sm:block w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function PopularPostsSkeleton() {
  return (
    <section className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/30 dark:via-amber-950/30 dark:to-yellow-950/30 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-orange-100 dark:border-orange-900/50">
      <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 dark:bg-navy-700 rounded-md sm:rounded-lg animate-pulse" />
        <div className="h-5 sm:h-6 w-16 sm:w-28 bg-gray-200 dark:bg-navy-700 rounded animate-pulse" />
      </div>
      <div className="space-y-1.5 sm:space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white/70 dark:bg-navy-800/50 rounded-lg sm:rounded-xl"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gray-200 dark:bg-navy-700 rounded-md sm:rounded-lg animate-pulse flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
              <div className="h-3.5 sm:h-4 bg-gray-200 dark:bg-navy-700 rounded animate-pulse w-3/4" />
              <div className="h-2.5 sm:h-3 bg-gray-200 dark:bg-navy-700 rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
