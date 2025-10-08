"use client";

import { Comment } from "@/types/community";
import { Heart, MessageCircle } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useState } from "react";
import CommentForm from "./CommentForm";

interface CommentItemProps {
  comment: Comment;
  postId: string;
  isReply?: boolean;
}

export default function CommentItem({
  comment,
  postId,
  isReply = false,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const relativeTime = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  const handleLike = () => {
    // TODO: Implement comment like functionality
  };

  return (
    <div className={`${isReply ? "ml-12" : ""}`}>
      <div className="flex gap-3">
        {/* Author Avatar */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          {comment.author.profileImage ? (
            <Image
              src={comment.author.profileImage}
              alt={comment.author.nickname}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
              {comment.author.nickname[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900 text-sm">
                {comment.author.nickname}
              </span>
              <span className="text-gray-500 text-xs">
                @{comment.author.username}
              </span>
            </div>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          {/* Comment Actions */}
          <div className="flex items-center gap-4 mt-2 px-3">
            <span className="text-xs text-gray-500">{relativeTime}</span>
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
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
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
