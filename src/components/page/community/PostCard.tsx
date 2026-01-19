"use client";

import { Heart, MessageCircle, Eye } from "lucide-react";
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
    <Link href={`/community/${post.id}`} className="block h-full">
      <article className="h-full bg-white rounded-[20px] border border-gray-200 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:border-gray-300 transition-all duration-200 cursor-pointer p-5 flex flex-col">
        {/* Post Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1 min-h-[48px]">
          {post.title}
        </h3>

        {/* Post Stats & Time */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            {/* Stats */}
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{post.viewCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{post.likeCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{post.commentCount.toLocaleString()}</span>
              </div>
            </div>

            {/* Time */}
            <span className="text-xs text-gray-400">
              {relativeTime}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
