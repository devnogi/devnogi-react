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
    <section className="bg-white/95 dark:bg-navy-700/95 rounded-2xl p-4 md:p-5 border border-gray-200 dark:border-navy-600">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <h2 className="font-semibold text-base text-gray-900 dark:text-white">
            지금 뜨는 글
          </h2>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          TOP 5
        </span>
      </div>

      {/* Post List */}
      <div className="space-y-1.5">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            href={`/community/${post.id}`}
            className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-navy-600 transition-colors"
          >
            {/* Rank Badge */}
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center font-semibold text-xs ${
                index === 0
                  ? "bg-orange-500 text-white"
                  : index === 1
                    ? "bg-gray-400 text-white"
                  : index === 2
                      ? "bg-amber-600 text-white"
                      : "bg-gray-100 dark:bg-navy-500 text-gray-600 dark:text-gray-300"
              }`}
            >
              {index + 1}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate group-hover:text-[var(--color-ds-primary)] transition-colors">
                {post.title}
              </h3>
              <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-400" />
                  {post.likeCount.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {post.viewCount.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {post.commentCount.toLocaleString()}
                </span>
                <span className="hidden md:inline">
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
              </div>
            </div>

            <ChevronRight className="hidden md:block w-4 h-4 text-gray-300 group-hover:text-[var(--color-ds-primary)] transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function PopularPostsSkeleton() {
  return (
    <section className="bg-white/95 dark:bg-navy-700/95 rounded-2xl p-4 md:p-5 border border-gray-200 dark:border-navy-600">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-gray-200 dark:bg-navy-600 rounded-lg animate-pulse" />
        <div className="h-5 w-20 bg-gray-200 dark:bg-navy-600 rounded animate-pulse" />
      </div>
      <div className="space-y-1.5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-2.5 rounded-xl"
          >
            <div className="w-6 h-6 bg-gray-200 dark:bg-navy-600 rounded-md animate-pulse flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="h-3.5 bg-gray-200 dark:bg-navy-600 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-navy-600 rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
