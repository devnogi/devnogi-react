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
      <div className="w-full py-4 md:py-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="bg-card rounded-xl border border-border">
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
    <div className="w-full py-4 md:py-6">
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
      <article className="bg-card rounded-xl border border-border">
        {/* Author Section */}
        <div className="p-4 md:p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {/* Profile Image */}
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {post.userId.toString()[0]}
              </div>

              {/* Author Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    사용자 {post.userId}
                  </span>
                  <span className="text-muted-foreground text-sm">·</span>
                  <span className="text-muted-foreground text-sm">
                    {relativeTime}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {formattedDate}
                </div>
              </div>
            </div>

            {/* Edit/Delete/Report Menu */}
            {(canEdit || canDelete || canReport) && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-muted rounded-full transition-colors">
                    <MoreVertical className="w-5 h-5 text-muted-foreground" />
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
        <div className="p-4 md:p-6">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-xl font-bold text-foreground bg-background border border-input rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="제목을 입력하세요"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
                className="w-full text-foreground/80 bg-background border border-input rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring resize-none min-h-[150px] md:min-h-[250px]"
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
              <h1 className="text-xl font-bold text-foreground mb-4">
                {post.title}
              </h1>
              <div className="text-foreground/80 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </div>
            </>
          )}
        </div>

        {/* Stats Bar */}
        <div className="px-4 py-3 md:px-6 md:py-4 border-t border-border">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
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
        <div className="px-4 py-3 md:px-6 border-t border-border flex items-center gap-2">
          <button
            onClick={handleLike}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
              post.isLiked
                ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                : "bg-muted text-foreground hover:bg-muted/80 dark:hover:bg-muted/70"
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
            className="flex-1 py-2.5 rounded-lg font-medium bg-muted text-foreground hover:bg-muted/80 dark:hover:bg-muted/70 transition-colors"
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
