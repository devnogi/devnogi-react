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
  Flag,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { clientAxios } from "@/lib/api/clients";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ReportDialog from "./ReportDialog";

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

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const isOwner = isAuthenticated && user?.userId === post?.userId;
  const isAdmin = isAuthenticated && user?.role === "ADMIN";
  const canEdit = isOwner;
  const canDelete = isOwner || isAdmin;
  const canReport = isAuthenticated && !isOwner;

  if (isLoading) {
    return (
      <div className="w-full py-2 md:py-4">
        <div className="mb-4">
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="bg-white/95 dark:bg-navy-700/95 rounded-2xl border border-gray-200 dark:border-navy-600">
          {/* Author skeleton */}
          <div className="p-4 md:p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          </div>
          {/* Body skeleton */}
          <div className="p-4 md:p-6 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          {/* Stats skeleton */}
          <div className="px-4 py-3 md:px-6 md:py-4 border-t border-border">
            <div className="flex gap-6">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
          {/* Actions skeleton */}
          <div className="px-4 py-3 md:px-6 border-t border-border flex gap-2">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 flex-1 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 dark:text-red-400">게시글을 불러오는데 실패했습니다.</p>
        <p className="text-sm text-muted-foreground mt-2">
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

  const handleDeleteConfirm = async () => {
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
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="w-full py-2 md:py-4">
      {/* Header */}
      <div className="mb-4">
        <Link href="/community">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 -ml-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            목록으로
          </Button>
        </Link>
      </div>

      {/* Post Content - Threads Style */}
      <article className="bg-white/95 dark:bg-navy-700/95 rounded-2xl border border-gray-200 dark:border-navy-600">
        {/* Author Section */}
        <div className="p-4 md:p-5 border-b border-gray-100 dark:border-navy-600">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {/* Profile Image */}
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {post.userId.toString()[0]}
              </div>

              {/* Author Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    사용자 {post.userId}
                  </span>
                  <span className="text-gray-300 dark:text-gray-500 text-sm">·</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {relativeTime}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {formattedDate}
                </div>
              </div>
            </div>

            {/* Edit/Delete/Report Menu */}
            {(canEdit || canDelete || canReport) && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-navy-600 rounded-full transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[120px]">
                  {canEdit && (
                    <DropdownMenuItem onClick={handleEditStart}>
                      <Pencil className="w-4 h-4 mr-2" />
                      수정
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={isSubmitting}
                      className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      삭제
                    </DropdownMenuItem>
                  )}
                  {canReport && (canEdit || canDelete) && (
                    <DropdownMenuSeparator />
                  )}
                  {canReport && (
                    <DropdownMenuItem
                      onClick={() => setShowReportDialog(true)}
                      className="text-orange-600 focus:text-orange-600 dark:text-orange-400 dark:focus:text-orange-400"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      신고
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Post Body */}
        <div className="p-4 md:p-5">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-xl font-bold text-gray-900 dark:text-gray-100 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-500 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-ds-primary)]/20 focus:border-[var(--color-ds-primary)]"
                placeholder="제목을 입력하세요"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
                className="w-full text-gray-700 dark:text-gray-200 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-ds-primary)]/20 focus:border-[var(--color-ds-primary)] resize-none min-h-[150px] md:min-h-[250px]"
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
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-snug">
                {post.title}
              </h1>
              <div className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed text-[15px] md:text-base">
                {post.content}
              </div>
            </>
          )}
        </div>

        {/* Stats Bar */}
        <div className="px-4 py-3 md:px-5 border-t border-gray-100 dark:border-navy-600">
          <div className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-navy-600">
              <Eye className="w-3.5 h-3.5" />
              <span>{post.viewCount.toLocaleString()}</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-navy-600">
              <Heart
                className={`w-3.5 h-3.5 ${post.isLiked ? "fill-red-500 text-red-500" : ""}`}
              />
              <span>{post.likeCount.toLocaleString()}</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-navy-600">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{post.commentCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-3 md:px-5 border-t border-gray-100 dark:border-navy-600 flex items-center gap-2">
          <button
            onClick={handleLike}
            className={`flex-1 py-2.5 rounded-xl font-medium transition-colors text-sm ${
              post.isLiked
                ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-navy-600 dark:text-gray-200 dark:hover:bg-navy-500"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Heart
                className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""}`}
              />
              <span className="text-sm hidden sm:inline">
                {post.isLiked ? "좋아요 취소" : "좋아요"}
              </span>
              <span className="text-sm sm:hidden">
                {post.isLiked ? "취소" : "좋아요"}
              </span>
            </div>
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-navy-600 dark:text-gray-200 dark:hover:bg-navy-500 transition-colors text-sm"
          >
            <div className="flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" />
              <span className="text-sm">공유</span>
            </div>
          </button>
        </div>
      </article>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>게시글 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              게시글을 삭제하시겠습니까? 삭제된 게시글은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
              variant="destructive"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  삭제 중...
                </>
              ) : (
                "삭제"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Dialog */}
      {post && (
        <ReportDialog
          open={showReportDialog}
          onOpenChange={setShowReportDialog}
          targetType="POST"
          targetId={post.id}
          targetUserId={post.userId}
        />
      )}
    </div>
  );
}
