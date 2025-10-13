"use client";

import { useInfinitePosts } from "@/hooks/useInfinitePosts";
import PostCard from "./PostCard";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface PostListProps {
  boardId?: number;
}

export default function PostList({ boardId }: PostListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfinitePosts({ boardId });

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">게시글을 불러오는데 실패했습니다.</p>
        <p className="text-sm text-gray-500 mt-2">
          {error instanceof Error ? error.message : "알 수 없는 오류"}
        </p>
      </div>
    );
  }

  const allPosts = data?.pages.flatMap((page) => page.items) ?? [];

  if (allPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">게시글이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {allPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

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
    </div>
  );
}
