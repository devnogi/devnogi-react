"use client";

import { Post } from "@/types/community";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const relativeTime = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Implement like functionality
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Implement share functionality
  };

  return (
    <Link href={`/community/${post.id}`}>
      <article className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 hover:border-gray-300 transition-colors">
        {/* Author Info */}
        <div className="flex items-start gap-3 mb-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            {post.author.profileImage ? (
              <Image
                src={post.author.profileImage}
                alt={post.author.nickname}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                {post.author.nickname[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 truncate">
                {post.author.nickname}
              </span>
              <span className="text-gray-500 text-sm truncate">
                @{post.author.username}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{relativeTime}</span>
              <span>·</span>
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                {post.boardName}
              </span>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
            {post.title}
          </h3>
          <p className="text-gray-700 line-clamp-3 whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className="mb-3">
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
                {post.images.slice(0, 4).map((image, index) => (
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
                    {index === 3 && post.images!.length > 4 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white text-xl font-semibold">
                          +{post.images!.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Post Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="text-sm text-blue-600 hover:underline"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 text-gray-600 hover:text-red-500 transition-colors group"
          >
            <Heart
              className={`w-5 h-5 ${post.isLiked ? "fill-red-500 text-red-500" : "group-hover:fill-red-100"}`}
            />
            <span className="text-sm">{post.likeCount}</span>
          </button>
          <div className="flex items-center gap-1.5 text-gray-600">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">{post.commentCount}</span>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-gray-600 hover:text-blue-500 transition-colors ml-auto"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </article>
    </Link>
  );
}
