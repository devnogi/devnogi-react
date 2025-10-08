"use client";

import { useQuery } from "@tanstack/react-query";
import { clientAxios } from "@/lib/api/clients";
import { PostDetail } from "@/types/community";
import { ArrowLeft, Heart, MessageCircle, Share2, MoreVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PostDetailViewProps {
  postId: string;
}

export default function PostDetailView({ postId }: PostDetailViewProps) {
  const {
    data: post,
    isLoading,
    isError,
    error,
  } = useQuery<PostDetail>({
    queryKey: ["post", postId],
    queryFn: async () => {
      const response = await clientAxios.get<PostDetail>(`/posts/${postId}`);
      return response.data;
    },
  });

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

  const handleLike = () => {
    // TODO: Implement like functionality
  };

  const handleShare = () => {
    // TODO: Implement share functionality
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/community">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
        </Link>
      </div>

      {/* Post Content */}
      <article className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Author Info */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
              {post.author.profileImage ? (
                <Image
                  src={post.author.profileImage}
                  alt={post.author.nickname}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-lg">
                  {post.author.nickname[0].toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  {post.author.nickname}
                </span>
                <span className="text-gray-500 text-sm">
                  @{post.author.username}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <span>{relativeTime}</span>
                <span>·</span>
                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                  {post.boardName}
                </span>
              </div>
            </div>
          </div>
          <button className="text-gray-500 hover:text-gray-700">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Post Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>

        {/* Post Body */}
        <div className="prose max-w-none mb-6">
          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className="mb-6">
            {post.images.length === 1 ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <Image
                  src={post.images[0]}
                  alt="Post image"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {post.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden"
                  >
                    <Image
                      src={image}
                      alt={`Post image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Post Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="text-sm text-blue-600 hover:underline cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Post Stats */}
        <div className="flex items-center gap-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors group"
          >
            <Heart
              className={`w-6 h-6 ${post.isLiked ? "fill-red-500 text-red-500" : "group-hover:fill-red-100"}`}
            />
            <span>{post.likeCount}</span>
          </button>
          <div className="flex items-center gap-2 text-gray-600">
            <MessageCircle className="w-6 h-6" />
            <span>{post.commentCount}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-sm">조회 {post.viewCount}</span>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors ml-auto"
          >
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </article>
    </div>
  );
}
