"use client";

import { usePostDetail } from "@/hooks/usePostDetail";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Pencil,
  Trash2,
  MoreVertical,
  X,
  Check,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { clientAxios } from "@/lib/api/clients";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface PostDetailViewProps {
  postId: string;
}

export default function PostDetailView({ postId }: PostDetailViewProps) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const {
    data: post,
    isLoading,
    isError,
    error,
    refetch,
  } = usePostDetail(Number(postId));

  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner = isAuthenticated && user?.userId === post?.userId;
  const isAdmin = isAuthenticated && user?.role === "ADMIN";
  const canEdit = isOwner;
  const canDelete = isOwner || isAdmin;

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

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.warning("로그인 후 사용 가능합니다.");
      return;
    }

    try {
      await clientAxios.post("/posts/like", {
        postId: Number(postId),
      });
      refetch();
    } catch (error) {
      console.error("Failed to toggle post like:", error);
      toast.error("좋아요 처리에 실패했습니다.");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("링크가 복사되었습니다.");
    }
  };

  const handleEditStart = () => {
    if (!post) return;
    setEditTitle(post.title);
    setEditContent(post.content);
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditTitle("");
    setEditContent("");
  };

  const handleEditSubmit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      toast.warning("제목과 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await clientAxios.patch(`/posts/${postId}`, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });
      toast.success("게시글이 수정되었습니다.");
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error("Failed to update post:", error);
      toast.error("게시글 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("게시글을 삭제하시겠습니까?");
    if (!confirmDelete) return;

    setIsSubmitting(true);
    try {
      await clientAxios.delete(`/posts/${postId}`);
      toast.success("게시글이 삭제되었습니다.");
      router.push("/community");
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error("게시글 삭제에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full px-4 py-6">
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

            {/* Edit/Delete Menu */}
            {(canEdit || canDelete) && !isEditing && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                    {canEdit && (
                      <button
                        onClick={handleEditStart}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Pencil className="w-4 h-4" />
                        수정
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={handleDelete}
                        disabled={isSubmitting}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        삭제
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Post Body */}
        <div className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-xl font-bold text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="제목을 입력하세요"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={10}
                className="w-full text-gray-700 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="내용을 입력하세요"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleEditCancel}
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4 mr-1" />
                  취소
                </Button>
                <Button
                  onClick={handleEditSubmit}
                  disabled={isSubmitting || !editTitle.trim() || !editContent.trim()}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-1" />
                  )}
                  저장
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </div>
            </>
          )}
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
    </div>
  );
}
