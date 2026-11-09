"use client";

import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Check,
  Flag,
  Heart,
  Loader2,
  MessageCircle,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

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
import { Button } from "@/components/ui/button";
import ServerCodeBadge from "@/components/ui/ServerCodeBadge";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { useAuth } from "@/contexts/AuthContext";
import { clientAxios } from "@/lib/api/clients";
import { CommentPageResponseItem } from "@/types/community";

import CommentForm from "./CommentForm";
import ReportDialog from "./ReportDialog";

interface CommentItemProps {
  comment: CommentPageResponseItem;
  postId: string;
  isReply?: boolean;
  replies?: CommentPageResponseItem[];
  onRefetch?: () => void;
}

export default function CommentItem({
  comment,
  postId,
  isReply = false,
  replies = [],
  onRefetch,
}: CommentItemProps) {
  const { user, isAuthenticated } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCancelEditDialog, setShowCancelEditDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const isOwner = isAuthenticated && user?.userId === comment.userId;
  const isAdmin = isAuthenticated && user?.role === "ADMIN";
  const canEdit = isOwner;
  const canDelete = isOwner || isAdmin;
  const canReport = isAuthenticated && !isOwner;

  // 수정 내용 변경 감지
  useEffect(() => {
    setHasUnsavedChanges(isEditing && editContent !== comment.content);
  }, [editContent, comment.content, isEditing]);

  // 뒤로가기 방지 (브라우저)
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // popstate 이벤트 처리 (브라우저 뒤로가기)
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges) {
        const confirmLeave = window.confirm(
          "수정 중인 내용이 사라집니다. 계속하시겠습니까?",
        );
        if (!confirmLeave) {
          e.preventDefault();
          window.history.pushState(null, "", window.location.href);
        }
      }
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [hasUnsavedChanges]);

  const handleLike = useCallback(async () => {
    if (!isAuthenticated) {
      toast.warning("로그인 후 사용 가능합니다.");
      return;
    }

    try {
      await clientAxios.post("/comments/like", {
        commentId: comment.id,
      });
      onRefetch?.();
    } catch (error) {
      console.error("Failed to toggle comment like:", error);
      toast.error("좋아요 처리에 실패했습니다.");
    }
  }, [isAuthenticated, comment.id, onRefetch]);

  const handleReplySuccess = useCallback(() => {
    setShowReplyForm(false);
    onRefetch?.();
  }, [onRefetch]);

  const handleEditStart = useCallback(() => {
    setEditContent(comment.content);
    setIsEditing(true);
  }, [comment.content]);

  const handleEditCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowCancelEditDialog(true);
      return;
    }
    setIsEditing(false);
    setEditContent(comment.content);
  }, [hasUnsavedChanges, comment.content]);

  const handleEditCancelConfirm = useCallback(() => {
    setIsEditing(false);
    setEditContent(comment.content);
    setShowCancelEditDialog(false);
  }, [comment.content]);

  const handleEditSubmit = useCallback(async () => {
    if (!editContent.trim()) {
      toast.warning("댓글 내용을 입력해주세요.");
      return;
    }

    if (editContent.trim() === comment.content) {
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);

    try {
      await clientAxios.patch(`/comments/manage/${comment.id}`, {
        content: editContent.trim(),
      });

      toast.success("댓글이 수정되었습니다.");
      setIsEditing(false);
      onRefetch?.();
    } catch (error) {
      console.error("Failed to update comment:", error);
      toast.error("댓글 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }, [editContent, comment.id, comment.content, onRefetch]);

  const handleDeleteConfirm = useCallback(async () => {
    setIsSubmitting(true);

    try {
      await clientAxios.delete(`/comments/manage/${comment.id}`);

      toast.success("댓글이 삭제되었습니다.");
      onRefetch?.();
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("댓글 삭제에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
      setShowDeleteDialog(false);
    }
  }, [comment.id, onRefetch]);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ko,
      });
    } catch {
      return "";
    }
  };

  // 삭제되거나 차단된 댓글 표시
  if (comment.isDeleted || comment.isBlocked) {
    return (
      <div
        className={`${isReply ? "ml-3 pl-2 md:ml-6 md:pl-3 border-l border-gray-200 dark:border-navy-500" : ""}`}
      >
        <div className="px-4 py-5 sm:px-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-navy-500" />
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              알 수 없음
            </span>
          </div>
          <p className="text-[15px] leading-6 font-normal text-muted-foreground italic">
            {comment.isDeleted ? "삭제된 댓글입니다." : "차단된 댓글입니다."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${isReply ? "ml-3 pl-2 md:ml-6 md:pl-3 border-l border-gray-200 dark:border-navy-500" : ""}`}
    >
      <div className="px-4 py-5 sm:px-5">
        {/* Header: Avatar + Nickname + Date + Actions (같은 행) */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-3">
            {/* Author Avatar */}
            <Link
              href={`/profile/${comment.userId}`}
              aria-label={`${comment.nickname} 프로필`}
              className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-full"
            >
              {comment.profileImageUrl ? (
                <Image
                  src={comment.profileImageUrl}
                  alt={`${comment.nickname ?? "사용자"} 프로필 사진`}
                  fill
                  sizes="44px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary text-sm font-semibold text-primary-foreground">
                  {comment.nickname?.[0] || comment.userId.toString()[0]}
                </div>
              )}
            </Link>
            {/* Nickname */}
            <div className="min-w-0">
              <Link
                href={`/profile/${comment.userId}`}
                className="flex items-center gap-1 text-[15px] leading-[22px] font-semibold tracking-[-0.01em] text-card-foreground hover:underline"
              >
                <ServerCodeBadge
                  serverName={comment.serverName}
                  verified={comment.verified}
                />
                <span className="break-words [overflow-wrap:anywhere]">
                  {comment.nickname || `사용자 ${comment.userId}`}
                </span>
                {comment.verified === true && <VerifiedBadge size="sm" />}
              </Link>
              {comment.createdAt && (
                <span className="text-xs leading-[18px] text-muted-foreground">
                  {formatDate(comment.createdAt)}
                </span>
              )}
            </div>
          </div>
          {/* Edit/Delete Buttons */}
          {!isEditing && (canEdit || canDelete) && (
            <div className="flex items-center gap-1">
              {canEdit && (
                <button
                  onClick={handleEditStart}
                  disabled={isSubmitting}
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 transition-colors hover:text-[var(--color-ds-primary)] dark:text-gray-400"
                  title="수정"
                >
                  <Pencil className="h-[18px] w-[18px]" />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isSubmitting}
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 transition-colors hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                  title="삭제"
                >
                  <Trash2 className="h-[18px] w-[18px]" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="ml-14 space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-navy-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-navy-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-ds-primary)]/20 focus:border-[var(--color-ds-primary)] resize-none text-sm"
              rows={3}
              disabled={isSubmitting}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEditCancel}
                disabled={isSubmitting}
                className="h-11 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                취소
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleEditSubmit}
                disabled={isSubmitting || !editContent.trim()}
                className="h-11 text-xs"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Check className="w-3 h-3 mr-1" />
                )}
                저장
              </Button>
            </div>
          </div>
        ) : (
          <p className="ml-14 whitespace-pre-wrap break-words text-[15px] leading-6 font-normal tracking-[-0.01em] text-card-foreground [overflow-wrap:anywhere]">
            {comment.content}
          </p>
        )}

        {/* Meta: Date + Actions */}
        {!isEditing && (
          <div className="ml-14 mt-3 flex flex-wrap items-center gap-x-6 gap-y-1">
            <button
              onClick={handleLike}
              className="inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-full text-xs leading-[18px] tabular-nums text-muted-foreground transition-colors hover:text-red-500 dark:hover:text-red-400"
            >
              <Heart
                className={`h-[18px] w-[18px] ${comment.isLiked ? "fill-red-500 text-red-500" : ""}`}
              />
              <span>{comment.likeCount}</span>
            </button>
            {!isReply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-full text-xs leading-[18px] text-muted-foreground transition-colors hover:text-[var(--color-ds-primary)]"
              >
                <MessageCircle className="h-[18px] w-[18px]" />
                <span>답글</span>
              </button>
            )}
            {canReport && (
              <button
                onClick={() => setShowReportDialog(true)}
                className="inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-full text-xs leading-[18px] text-muted-foreground transition-colors hover:text-[var(--color-ds-primary)]"
              >
                <Flag className="h-[18px] w-[18px]" />
                <span>신고</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Reply Form */}
      {showReplyForm && !isReply && (
        <section
          aria-label="답글 작성"
          className="mt-3 mr-3 ml-3 rounded-xl border border-border/80 bg-muted/30 p-3 md:mr-4 md:ml-6 md:p-4"
        >
          <CommentForm
            postId={postId}
            parentCommentId={comment.id}
            onSuccess={handleReplySuccess}
            onCancel={() => setShowReplyForm(false)}
          />
        </section>
      )}

      {/* Replies */}
      {replies && replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              isReply
              onRefetch={onRefetch}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>댓글 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              댓글을 삭제하시겠습니까? 삭제된 댓글은 복구할 수 없습니다.
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
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  삭제 중...
                </>
              ) : (
                "삭제"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Edit Confirmation Dialog */}
      <AlertDialog
        open={showCancelEditDialog}
        onOpenChange={setShowCancelEditDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>수정 취소</AlertDialogTitle>
            <AlertDialogDescription>
              수정 중인 내용이 사라집니다. 취소하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>계속 수정</AlertDialogCancel>
            <AlertDialogAction onClick={handleEditCancelConfirm}>
              취소
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Dialog */}
      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        targetType="COMMENT"
        targetId={comment.id}
        targetUserId={comment.userId}
      />
    </div>
  );
}
