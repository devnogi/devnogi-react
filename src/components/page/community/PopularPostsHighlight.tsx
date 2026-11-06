"use client";

import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronRight, Eye, Flame, Heart, MessageCircle } from "lucide-react";
import Link from "next/link";

import { useInfinitePosts } from "@/hooks/useInfinitePosts";

interface PopularPostsHighlightProps {
  boardId?: number;
}

export default function PopularPostsHighlight({
  boardId: _boardId,
}: PopularPostsHighlightProps) {
  const { data, isLoading, isError } = useInfinitePosts({
    tab: "popular",
    size: 10,
  });
  return (
    <PopularPostsContent data={data} isLoading={isLoading} isError={isError} />
  );
}

export function PopularPostsContent({
  data,
  isLoading,
  isError,
}: Pick<
  ReturnType<typeof useInfinitePosts>,
  "data" | "isLoading" | "isError"
>) {
  const posts = data?.pages.flatMap((page) => page.items).slice(0, 5);

  if (isLoading) {
    return <PopularPostsSkeleton />;
  }

  if (isError || !posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="bg-card text-card-foreground rounded-[10px] p-4 md:p-5 border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 bg-[var(--color-ds-primary-50)] rounded-lg">
            <Flame className="w-4 h-4 text-[var(--color-ds-primary)]" />
          </div>
          <h2 className="font-semibold text-base text-card-foreground">
            지금 뜨는 글
          </h2>
        </div>
        <span className="text-xs leading-[18px] text-muted-foreground">
          TOP 5
        </span>
      </div>

      {/* Post List */}
      <div className="space-y-1.5">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            href={`/community/${post.id}`}
            prefetch={false}
            className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors"
          >
            {/* Rank Badge */}
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center font-semibold text-xs ${
                index === 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-[var(--color-ds-primary-50)] text-[var(--color-ds-primary)]"
              }`}
            >
              {index + 1}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-card-foreground truncate group-hover:text-[var(--color-ds-primary)] transition-colors">
                {post.title}
              </h3>
              <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-1 text-xs leading-[18px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-muted-foreground" />
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
    <section
      role="status"
      aria-label="인기글을 불러오는 중"
      className="bg-card text-card-foreground rounded-[10px] p-4 md:p-5 border border-border"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-muted rounded-lg animate-pulse" />
        <div className="h-5 w-20 bg-muted rounded animate-pulse" />
      </div>
      <div className="space-y-1.5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl">
            <div className="w-6 h-6 bg-muted rounded-md animate-pulse flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="h-3.5 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
