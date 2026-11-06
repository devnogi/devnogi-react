"use client";

import { Loader2 } from "lucide-react";

import { normalizePostSummary } from "@/hooks/useInfinitePosts";
import { usePostDetail } from "@/hooks/usePostDetail";
import type { PostDetail } from "@/lib/community/public-post";

import PostCard from "./PostCard";

interface Props {
  postId: string;
  initialPost?: PostDetail;
  cacheScope?: string;
}

export default function PostDetailView({
  postId,
  initialPost,
  cacheScope,
}: Props) {
  const {
    data: post,
    isLoading,
    isError,
    refetch,
  } = usePostDetail(Number(postId), { initialData: initialPost, cacheScope });
  if (isLoading)
    return (
      <div className="flex justify-center bg-card py-20">
        <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
      </div>
    );
  if (isError || !post)
    return (
      <div className="bg-card p-8 text-center">
        <p className="text-gray-600 dark:text-gray-300">
          게시글을 불러오지 못했어요.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 h-11 rounded-full border border-gray-300 px-5 text-sm"
        >
          다시 시도
        </button>
      </div>
    );
  const item = normalizePostSummary({
    ...post,
    content: post.content,
    title: post.title,
    username: post.username,
    author: post.author,
    media: post.media,
    imageUrlList: post.imageUrlList,
    liked: post.liked ?? post.isLiked,
    bookmarked: post.bookmarked ?? post.isBookmarked ?? false,
  });
  return (
    <div>
      <PostCard post={item} />
    </div>
  );
}
