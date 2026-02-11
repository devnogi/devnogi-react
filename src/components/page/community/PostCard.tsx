"use client";

import { Heart, MessageCircle, Eye } from "lucide-react";
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
  const nickname = post.author?.nickname || "익명";
  const avatarText = nickname.slice(0, 1).toUpperCase();

  return (
    <Link href={`/community/${post.id}`} className="block">
      <article className="rounded-2xl border border-gray-200/90 dark:border-navy-600 bg-white/95 dark:bg-navy-700/95 hover:bg-white dark:hover:bg-navy-700 transition-colors p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-teal-500 text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">
            {avatarText}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {nickname}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {relativeTime}
            </div>
          </div>
        </div>

        <h3 className="mt-3 text-[15px] md:text-base font-medium text-gray-900 dark:text-gray-100 leading-relaxed line-clamp-2">
          {post.title}
        </h3>

        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-navy-600 flex items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400">
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-navy-600">
            <Heart className="w-3.5 h-3.5" />
            <span>{post.likeCount.toLocaleString()}</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-navy-600">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{post.commentCount.toLocaleString()}</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-navy-600 ml-auto">
            <Eye className="w-3.5 h-3.5" />
            <span>{post.viewCount.toLocaleString()}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
