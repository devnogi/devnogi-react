"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import DataFetchError from "@/components/commons/DataFetchError";
import { useAuth } from "@/contexts/AuthContext";
import { useInfinitePosts } from "@/hooks/useInfinitePosts";
import type { BackendPostsData } from "@/lib/community/feed";
import type { FeedTab } from "@/types/community";

import PostCard from "./PostCard";
import PostListSkeleton from "./PostListSkeleton";

interface PostListProps {
  initial?: BackendPostsData;
  startPage?: number;
  tab?: FeedTab;
  boardId?: number;
  keyword?: string;
  sortType?: "latest" | "popular" | "mostLiked";
  userId?: number;
}

export default function PostList({
  initial,
  startPage = 1,
  tab,
  boardId,
  keyword,
  sortType,
  userId,
}: PostListProps) {
  const { user } = useAuth();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    isPlaceholderData,
    refetch,
  } = useInfinitePosts({
    tab,
    boardId,
    keyword,
    sortType,
    userId,
    initialData: initial,
    startPage,
    cacheScope: user ? `user:${user.userId}` : "public",
  });

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // 로딩 중일 때 Skeleton UI 표시
  if (isLoading) {
    return <PostListSkeleton />;
  }

  // 에러 발생 시 DataFetchError 표시
  if (isError) {
    return (
      <DataFetchError
        message="게시글 데이터를 받아오지 못 하였습니다"
        onRetry={() => refetch()}
        showRetry={true}
      />
    );
  }

  const allPosts = data?.pages.flatMap((page) => page.items) ?? [];

  if (allPosts.length === 0) {
    return (
      <div className="bg-white dark:bg-navy-800 py-16">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {tab === "bookmarks"
              ? "아직 저장한 글이 없어요."
              : tab === "mine" || userId
                ? "작성한 게시글이 없어요."
                : "아직 게시글이 없어요."}
          </p>
          {!userId && tab !== "bookmarks" && tab !== "mine" && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              첫 번째 게시글을 작성해보세요.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Card List Layout */}
      <div>
        {allPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            viewerPending={!!user && isPlaceholderData}
          />
        ))}
      </div>

      {(!tab || tab === "latest") && !userId && !keyword && (
        <nav
          aria-label="커뮤니티 페이지 이동"
          className="flex justify-center gap-6 border-t border-border px-4 py-3 text-sm"
        >
          {startPage > 1 && (
            <Link
              className="inline-flex min-h-11 items-center"
              href={
                startPage === 2
                  ? "/community"
                  : `/community?page=${startPage - 1}`
              }
            >
              이전 페이지
            </Link>
          )}
          {hasNextPage && (
            <Link
              className="inline-flex min-h-11 items-center"
              href={`/community?page=${(data?.pages.at(-1)?.meta.currentPage ?? startPage) + 1}`}
            >
              다음 페이지
            </Link>
          )}
        </nav>
      )}
      {/* Infinite Scroll Observer */}
      <div ref={observerTarget} className="py-4">
        {isFetchingNextPage && (
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-gray-500" />
          </div>
        )}
        {!hasNextPage && allPosts.length > 0 && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            모든 게시글을 확인했습니다.
          </p>
        )}
      </div>
    </>
  );
}
