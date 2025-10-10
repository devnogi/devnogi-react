"use client";

import { usePostDetail } from "@/hooks/usePostDetail";
import { ArrowLeft, Heart, MessageCircle, Share2, Eye } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import CommentList from "./CommentList";

interface PostDetailViewProps {
  postId: string;
}

export default function PostDetailView({ postId }: PostDetailViewProps) {
  const {
    data: post,
    isLoading,
    isError,
    error,
  } = usePostDetail(Number(postId));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">게시글을 불러오는데 실패했습니다.</p>
        <p className="text-sm text-gray-500 mt-2">
          {error instanceof Error ? error.message : "알 수 없는 오류"}
        </p>
      </div>
    );
  }

  const relativeTime = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  const formattedDate = new Date(post.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleLike = () => {
    // TODO: Implement like functionality
  };

  const handleShare = () => {
    // TODO: Implement share functionality
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/community">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            목록으로
          </Button>
        </Link>
      </div>

      {/* Post Content - Threads Style */}
      <article className="bg-white rounded-xl border border-gray-200">
        {/* Author Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {/* Profile Image */}
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {post.userId.toString()[0]}
              </div>

              {/* Author Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    사용자 {post.userId}
                  </span>
                  <span className="text-gray-400 text-sm">·</span>
                  <span className="text-gray-500 text-sm">
                    {relativeTime}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {formattedDate}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Post Body */}
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>{post.viewCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart
                className={`w-4 h-4 ${post.isLiked ? "fill-red-500 text-red-500" : ""}`}
              />
              <span>{post.likeCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4" />
              <span>{post.commentCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-3 border-t border-gray-100 flex items-center gap-2">
          <button
            onClick={handleLike}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
              post.isLiked
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Heart
                className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""}`}
              />
              <span className="text-sm">
                {post.isLiked ? "좋아요 취소" : "좋아요"}
              </span>
            </div>
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 rounded-lg font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" />
              <span className="text-sm">공유</span>
            </div>
          </button>
        </div>
      </article>

      {/* Comments Section */}
      <div className="mt-6">
        <CommentList postId={Number(postId)} />
      </div>
    </div>
  );
}
