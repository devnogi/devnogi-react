"use client";

import { useQuery } from "@tanstack/react-query";
import { clientAxios } from "@/lib/api/clients";
import { Comment, CommentsResponse } from "@/types/community";
import CommentItem from "./CommentItem";
import { Loader2 } from "lucide-react";

interface CommentListProps {
  postId: string;
}

export default function CommentList({ postId }: CommentListProps) {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<CommentsResponse>({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const response = await clientAxios.get<CommentsResponse>(
        `/posts/${postId}/comments`,
      );
      return response.data;
    },
  });

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

  const comments = data?.comments || [];

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">첫 댓글을 작성해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        댓글 {data?.totalCount || 0}
      </h3>
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} postId={postId} />
        ))}
      </div>
    </div>
  );
}
