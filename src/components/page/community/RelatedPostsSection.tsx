"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { usePostDetail } from "@/hooks/usePostDetail";
import { useInfinitePosts } from "@/hooks/useInfinitePosts";
import PostCard from "./PostCard";
import { Button } from "@/components/ui/button";

interface RelatedPostsSectionProps {
  postId: string;
}

const INITIAL_VISIBLE_COUNT = 6;
const LOAD_MORE_STEP = 6;

export default function RelatedPostsSection({
  postId,
}: RelatedPostsSectionProps) {
  const numericPostId = Number(postId);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const {
    data: currentPost,
    isLoading: isPostLoading,
    isError: isPostError,
    refetch: refetchPost,
  } = usePostDetail(numericPostId);

  const {
    data: boardData,
    fetchNextPage: fetchNextBoardPage,
    hasNextPage: hasNextBoardPage,
    isFetchingNextPage: isFetchingNextBoardPage,
    isLoading: isBoardLoading,
    isError: isBoardError,
    refetch: refetchBoardPosts,
  } = useInfinitePosts({
    boardId: currentPost?.boardId,
    sortType: "latest",
    size: 20,
    enabled: !!currentPost?.boardId,
  });

  const boardRelatedPosts = useMemo(() => {
    const posts = boardData?.pages.flatMap((page) => page.items) ?? [];
    return posts.filter((post) => post.id !== numericPostId);
  }, [boardData, numericPostId]);

  const shouldEnableFallback =
    !!currentPost &&
    !isBoardLoading &&
    !isBoardError &&
    !hasNextBoardPage &&
    boardRelatedPosts.length < INITIAL_VISIBLE_COUNT;

  const {
    data: fallbackData,
    fetchNextPage: fetchNextFallbackPage,
    hasNextPage: hasNextFallbackPage,
    isFetchingNextPage: isFetchingNextFallbackPage,
    isLoading: isFallbackLoading,
    isError: isFallbackError,
    refetch: refetchFallbackPosts,
  } = useInfinitePosts({
    sortType: "latest",
    size: 20,
    enabled: shouldEnableFallback,
  });

  const fallbackRelatedPosts = useMemo(() => {
    const posts = fallbackData?.pages.flatMap((page) => page.items) ?? [];
    return posts.filter((post) => post.id !== numericPostId);
  }, [fallbackData, numericPostId]);

  const relatedPosts = useMemo(() => {
    const merged = [];
    const seenPostIds = new Set<number>();

    boardRelatedPosts.forEach((post) => {
      if (seenPostIds.has(post.id)) return;
      seenPostIds.add(post.id);
      merged.push(post);
    });

    fallbackRelatedPosts.forEach((post) => {
      if (seenPostIds.has(post.id)) return;
      seenPostIds.add(post.id);
      merged.push(post);
    });

    return merged;
  }, [boardRelatedPosts, fallbackRelatedPosts]);

  const visiblePosts = relatedPosts.slice(0, visibleCount);
  const canShowMoreFromLoaded = visibleCount < relatedPosts.length;
  const canLoadMoreFromServer = !!hasNextBoardPage || !!hasNextFallbackPage;
  const isFetchingNextPage = isFetchingNextBoardPage || isFetchingNextFallbackPage;

  const handleShowMore = async () => {
    if (canShowMoreFromLoaded) {
      setVisibleCount((prev) => prev + LOAD_MORE_STEP);
      return;
    }

    if (hasNextBoardPage && !isFetchingNextBoardPage) {
      await fetchNextBoardPage();
      setVisibleCount((prev) => prev + LOAD_MORE_STEP);
      return;
    }

    if (hasNextFallbackPage && !isFetchingNextFallbackPage) {
      await fetchNextFallbackPage();
      setVisibleCount((prev) => prev + LOAD_MORE_STEP);
    }
  };

  if (isPostLoading || isBoardLoading || (shouldEnableFallback && isFallbackLoading)) {
    return (
      <section className="bg-white/95 dark:bg-navy-700/95 rounded-2xl border border-gray-200 dark:border-navy-600 p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-36 rounded bg-gray-200 dark:bg-navy-600 animate-pulse" />
          <div className="h-4 w-20 rounded bg-gray-200 dark:bg-navy-600 animate-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-32 rounded-2xl bg-gray-100 dark:bg-navy-600/60 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (isPostError || isBoardError) {
    return (
      <section className="bg-white/95 dark:bg-navy-700/95 rounded-2xl border border-gray-200 dark:border-navy-600 p-4 md:p-5">
        <div className="text-center py-4">
          <p className="text-sm text-red-500 dark:text-red-400">
            추천 게시글을 불러오지 못했습니다.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 rounded-xl"
            onClick={() => {
              void refetchPost();
              void refetchBoardPosts();
            }}
          >
            다시 시도
          </Button>
        </div>
      </section>
    );
  }

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className="bg-white/95 dark:bg-navy-700/95 rounded-2xl border border-gray-200 dark:border-navy-600 p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {boardRelatedPosts.length > 0
            ? "같은 게시판의 다른 글"
            : "다른 글 추천"}
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {visiblePosts.length} / {relatedPosts.length}
        </span>
      </div>

      <div className="space-y-3">
        {visiblePosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {(canShowMoreFromLoaded || canLoadMoreFromServer) && (
        <div className="pt-4 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl w-full sm:w-auto"
            onClick={handleShowMore}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                불러오는 중...
              </>
            ) : (
              "게시글 더 보기"
            )}
          </Button>
        </div>
      )}

      {isFallbackError && (
        <div className="pt-3 text-center">
          <button
            type="button"
            onClick={() => {
              void refetchFallbackPosts();
            }}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-[var(--color-ds-primary)] transition-colors"
          >
            추가 추천 게시글을 불러오지 못했습니다. 다시 시도
          </button>
        </div>
      )}
    </section>
  );
}
