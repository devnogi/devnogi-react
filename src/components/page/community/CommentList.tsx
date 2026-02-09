"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { clientAxios } from "@/lib/api/clients";
import {
  ApiResponse,
  BackendCommentsResponse,
  CommentPageResponseItem,
} from "@/types/community";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import { Loader2 } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";

interface CommentListProps {
  postId: string;
}

const PAGE_SIZE = 20;

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
  } = useInfiniteQuery<ApiResponse<BackendCommentsResponse>>({
    queryKey: ["comments", postId],
    queryFn: async ({ pageParam }) => {
      const response = await clientAxios.get<
        ApiResponse<BackendCommentsResponse>
      >(`/comments/${postId}`, {
        params: {
          page: pageParam,
          size: PAGE_SIZE,
          sortBy: "createdAt",
          direction: "desc",
        },
      });
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.data?.meta;
      if (!meta || meta.isLast) return undefined;
      return meta.currentPage + 1;
    },
  });

  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">댓글을 불러오는데 실패했습니다.</p>
        <p className="text-sm text-gray-500 mt-1">
          {error instanceof Error ? error.message : "알 수 없는 오류"}
        </p>
      </div>
    );
  }

  const comments =
    data?.pages.flatMap((page) => page.data?.items || []) || [];
  const totalCount = data?.pages[0]?.data?.meta?.totalElements || 0;

  // 대댓글 구조로 변환
  const topLevelComments = comments.filter((c) => !c.parentComment);
  const repliesMap = comments.reduce(
    (acc, comment) => {
      if (comment.parentComment) {
        if (!acc[comment.parentComment]) {
          acc[comment.parentComment] = [];
        }
        acc[comment.parentComment].push(comment);
      }
      return acc;
    },
    {} as Record<number, CommentPageResponseItem[]>,
  );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        댓글 {totalCount}
      </h3>

      {/* Comments */}
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">첫 댓글을 작성해보세요!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              replies={repliesMap[comment.id] || []}
              onRefetch={handleRefetch}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full sm:w-auto"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                불러오는 중...
              </>
            ) : (
              "댓글 더보기"
            )}
          </Button>
        </div>
      )}

      {/* Comment Form (bottom) */}
      <div className="pt-4 border-t border-gray-200">
        <CommentForm postId={postId} onSuccess={handleRefetch} />
      </div>
    </div>
  );
}
