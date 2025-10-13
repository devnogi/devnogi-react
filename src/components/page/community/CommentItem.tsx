"use client";

import { CommentPageResponseItem } from "@/types/community";
import { Heart, MessageCircle } from "lucide-react";
import { useState } from "react";
import CommentForm from "./CommentForm";

interface CommentItemProps {
  comment: CommentPageResponseItem;
  postId: string;
  isReply?: boolean;
  replies?: CommentPageResponseItem[];
}

export default function CommentItem({
  comment,
  postId,
  isReply = false,
  replies = [],
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleLike = () => {
    // TODO: Implement comment like functionality
  };

  // 삭제되거나 차단된 댓글 표시
  if (comment.isDeleted || comment.isBlocked) {
    return (
      <div className={`${isReply ? "ml-12" : ""}`}>
        <div className="flex gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200" />
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-400 text-sm italic">
                {comment.isDeleted
                  ? "삭제된 댓글입니다."
                  : "차단된 댓글입니다."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isReply ? "ml-12" : ""}`}>
      <div className="flex gap-3">
        {/* Author Avatar */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
            {comment.userId.toString()[0]}
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900 text-sm">
                사용자 {comment.userId}
              </span>
            </div>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          {/* Comment Actions */}
          <div className="flex items-center gap-4 mt-2 px-3">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors text-xs"
            >
              <Heart
                className={`w-3.5 h-3.5 ${comment.isLiked ? "fill-red-500 text-red-500" : ""}`}
              />
              <span>{comment.likeCount}</span>
            </button>
            {!isReply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors text-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>답글</span>
              </button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && !isReply && (
            <div className="mt-3">
              <CommentForm
                postId={postId}
                parentCommentId={comment.id}
                onSuccess={() => setShowReplyForm(false)}
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {replies && replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}
