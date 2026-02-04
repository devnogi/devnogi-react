"use client";

import { Heart, MessageCircle, Eye, User } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface Author {
  id: number;
  username: string;
  nickname: string;
  profileImage?: string;
}

interface PostSummary {
  id: number;
  title: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  author: Author;
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
      <article className="h-full bg-white dark:bg-navy-700 rounded-[20px] border border-gray-200 dark:border-navy-600 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:border-gray-300 dark:hover:border-navy-500 transition-all duration-200 cursor-pointer p-5 flex flex-col">
        {/* Post Title */}
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1 min-h-[48px]">
          {post.title}
        </h3>

        {/* Author & Time */}
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span className="truncate max-w-[120px]">{post.author?.nickname || "익명"}</span>
          </div>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
            {relativeTime}
          </span>
        </div>

        {/* Post Stats */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-navy-600">
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
        </div>
      </article>
    </Link>
  );
}
