"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { clientAxios } from "@/lib/api/clients";
import type {
  ApiResponse,
  BackendCommentsResponse,
  CommentThreadResponseItem,
  CommentThreadsResponse,
} from "@/types/community";

import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

interface CommentListProps {
  postId: string;
}
const PAGE_SIZE = 20;

function normalizeThread(
  thread: CommentThreadResponseItem,
): CommentThreadResponseItem {
  const normalize = (comment: CommentThreadResponseItem["comment"]) => ({
    ...comment,
    nickname:
      comment.nickname?.trim() ||
      comment.username?.trim() ||
      `사용자 ${comment.userId}`,
  });
  return {
    ...thread,
    comment: normalize(thread.comment),
    replies: thread.replies.map(normalize),
  };
}

function CommentThread({
  postId,
  thread,
  onRefetch,
}: {
  postId: string;
  thread: CommentThreadResponseItem;
  onRefetch: () => void;
}) {
  const { data, fetchNextPage, hasNextPage, isFetching, refetch } =
    useInfiniteQuery<ApiResponse<BackendCommentsResponse>>({
      queryKey: ["comment-replies", postId, thread.comment.id],
      queryFn: async ({ pageParam }) =>
        (
          await clientAxios.get<ApiResponse<BackendCommentsResponse>>(
            `/comments/${postId}/${thread.comment.id}/replies`,
            { params: { page: pageParam, size: PAGE_SIZE } },
          )
        ).data,
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.data.meta.isLast
          ? undefined
          : lastPage.data.meta.currentPage + 1,
      enabled: false,
    });
  const fetched = (data?.pages.flatMap((page) => page.data.items) ?? []).map(
    (comment) => ({
      ...comment,
      nickname:
        comment.nickname?.trim() ||
        comment.username?.trim() ||
        `사용자 ${comment.userId}`,
    }),
  );
  const replies = [...thread.replies, ...fetched].filter(
    (reply, index, all) =>
      all.findIndex((item) => item.id === reply.id) === index,
  );
  const remaining = Math.max(0, thread.replyCount - replies.length);
  const loadMore = async () => {
    if (data) await fetchNextPage();
    else await refetch();
  };

  return (
    <div>
      <CommentItem
        comment={thread.comment}
        postId={postId}
        replies={replies}
        onRefetch={onRefetch}
      />
      {(remaining > 0 || hasNextPage) && (
        <button
          type="button"
          onClick={loadMore}
          disabled={isFetching}
          className="ml-12 mt-2 flex h-11 items-center gap-2 rounded-full px-3 text-xs font-semibold text-[var(--color-ds-primary)] hover:bg-[var(--color-ds-primary-50)] disabled:opacity-50 dark:hover:bg-navy-700"
        >
          {isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          답글 {remaining || PAGE_SIZE}개 더 보기
        </button>
      )}
    </div>
  );
}

export default function CommentList({ postId }: CommentListProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<ApiResponse<CommentThreadsResponse>>({
    queryKey: ["comment-threads", postId],
    queryFn: async ({ pageParam }) =>
      (
        await clientAxios.get<ApiResponse<CommentThreadsResponse>>(
          `/comments/${postId}/threads`,
          { params: { page: pageParam, size: PAGE_SIZE } },
        )
      ).data,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.isLast
        ? undefined
        : lastPage.data.meta.currentPage + 1,
  });
  const handleRefetch = useCallback(() => {
    void refetch();
  }, [refetch]);

  if (isLoading)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  if (isError)
    return (
      <div className="py-8 text-center">
        <p className="text-red-500">댓글을 불러오는데 실패했습니다.</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {error instanceof Error ? error.message : "알 수 없는 오류"}
        </p>
      </div>
    );

  const threads = (data?.pages.flatMap((page) => page.data.items) ?? []).map(
    normalizeThread,
  );
  const totalCount = data?.pages[0]?.data.meta.totalElements ?? 0;
  return (
    <div>
      <h3 className="px-4 pt-5 pb-1 text-base leading-6 font-semibold text-card-foreground sm:px-5">
        댓글{" "}
        <span className="text-xs leading-[18px] font-normal text-muted-foreground">
          {totalCount}
        </span>
      </h3>
      {threads.length === 0 ? (
        <p className="py-8 text-center text-gray-500 dark:text-gray-400">
          첫 댓글을 작성해보세요!
        </p>
      ) : (
        <div className="divide-y divide-border">
          {threads.map((thread) => (
            <CommentThread
              key={thread.comment.id}
              postId={postId}
              thread={thread}
              onRefetch={handleRefetch}
            />
          ))}
        </div>
      )}
      {hasNextPage && (
        <div className="flex justify-center px-4 py-4 sm:px-5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full rounded-xl sm:w-auto"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                불러오는 중...
              </>
            ) : (
              "댓글 더보기"
            )}
          </Button>
        </div>
      )}
      <div className="border-t border-border p-4 sm:p-5">
        <CommentForm postId={postId} onSuccess={handleRefetch} />
      </div>
    </div>
  );
}
