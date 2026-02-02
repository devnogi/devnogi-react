"use client";

import { useInfinitePosts } from "@/hooks/useInfinitePosts";
import PostCard from "./PostCard";
import PostListSkeleton from "./PostListSkeleton";
import DataFetchError from "@/components/commons/DataFetchError";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface PostListProps {
  boardId?: number;
  keyword?: string;
  sortType?: "latest" | "popular" | "mostLiked";
}

export default function PostList({ boardId, keyword, sortType }: PostListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfinitePosts({ boardId, keyword, sortType });

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
      <div className="bg-white rounded-[20px] border border-gray-200 shadow-[0_8px_24px_rgba(0,0,0,0.08)] py-12">
        <div className="text-center">
          <p className="text-gray-500 text-lg">게시글이 없습니다.</p>
          <p className="text-gray-400 text-sm mt-2">
            첫 번째 게시글을 작성해보세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Card Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Infinite Scroll Observer */}
      <div ref={observerTarget} className="py-4">
        {isFetchingNextPage && (
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )}
        {!hasNextPage && allPosts.length > 0 && (
          <p className="text-center text-sm text-gray-500">
            모든 게시글을 확인했습니다.
          </p>
        )}
      </div>
    </>
  );
}
