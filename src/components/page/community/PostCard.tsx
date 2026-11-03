"use client";

import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Eye, Heart, MessageCircle } from "lucide-react";
import Link from "next/link";

import VerifiedBadge from "@/components/ui/VerifiedBadge";
import type { PostSummary } from "@/hooks/useInfinitePosts";

interface PostCardProps {
  post: PostSummary;
}

export default function PostCard({ post }: PostCardProps) {
  const relativeTime = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ko,
  });
  const displayName =
    post.username?.trim() || post.author?.nickname || `사용자 ${post.userId}`;
  const avatarText = displayName.slice(0, 1).toUpperCase();

  return (
    <Link href={`/community/${post.id}`} prefetch={false} className="block">
      <article className="rounded-lg border border-gray-200/90 dark:border-navy-600 bg-white dark:bg-navy-800 hover:bg-white dark:hover:bg-navy-700 transition-colors px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#9a451f] text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">
            {avatarText}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate flex items-center gap-1">
              {displayName}
              {post.author?.verified === true && <VerifiedBadge size="sm" />}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {relativeTime}
            </div>
          </div>
        </div>

        <h3 className="mt-2 text-base font-medium text-gray-900 dark:text-gray-100 leading-relaxed line-clamp-2">
          {post.title}
        </h3>

        <div className="mt-1.5 flex items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400">
          <div className="inline-flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            <span>{post.likeCount.toLocaleString()}</span>
          </div>
          <div className="inline-flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{post.commentCount.toLocaleString()}</span>
          </div>
          <div className="inline-flex items-center gap-1 ml-auto">
            <Eye className="w-3.5 h-3.5" />
            <span>{post.viewCount.toLocaleString()}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
