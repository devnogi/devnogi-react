"use client";

import { Heart, MessageCircle, Share2, Eye } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface PostSummary {
  id: number;
  title: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

interface PostCardProps {
  post: PostSummary;
}

export default function PostCard({ post }: PostCardProps) {
  const relativeTime = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <Link href={`/community/${post.id}`} className="block">
      <article className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 hover:border-gray-300 transition-colors">
        {/* Post Content */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {post.title}
          </h3>
          <div className="text-sm text-gray-500">
            {relativeTime}
          </div>
        </div>

        {/* Post Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span>{post.viewCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4" />
            <span>{post.likeCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" />
            <span>{post.commentCount.toLocaleString()}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
