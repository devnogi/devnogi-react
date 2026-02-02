"use client";

import { CommentPageResponseItem } from "@/types/community";
import { Heart, MessageCircle, Pencil, Trash2, X, Check, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import CommentForm from "./CommentForm";
import { useAuth } from "@/contexts/AuthContext";
import { clientAxios } from "@/lib/api/clients";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

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

  const isOwner = isAuthenticated && user?.userId === comment.userId;
  const isAdmin = isAuthenticated && user?.role === "ADMIN";
  const canEdit = isOwner;
  const canDelete = isOwner || isAdmin;

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
        const confirmLeave = window.confirm("수정 중인 내용이 사라집니다. 계속하시겠습니까?");
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
      const confirmCancel = window.confirm("수정 중인 내용이 사라집니다. 취소하시겠습니까?");
      if (!confirmCancel) return;
    }
    setIsEditing(false);
    setEditContent(comment.content);
  }, [hasUnsavedChanges, comment.content]);

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

  const handleDelete = useCallback(async () => {
    const confirmDelete = window.confirm("댓글을 삭제하시겠습니까?");
    if (!confirmDelete) return;

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
      <div className={`${isReply ? "ml-6 pl-3 border-l-2 border-gray-100" : ""}`}>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200" />
            <span className="text-gray-400 text-sm">알 수 없음</span>
          </div>
          <p className="text-gray-400 text-sm italic">
            {comment.isDeleted
              ? "삭제된 댓글입니다."
              : "차단된 댓글입니다."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isReply ? "ml-6 pl-3 border-l-2 border-gray-100" : ""}`}>
      <div className="bg-gray-50 rounded-lg p-3">
        {/* Header: Avatar + Nickname + Date + Actions (같은 행) */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* Author Avatar */}
            <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                {comment.nickname?.[0] || comment.userId.toString()[0]}
              </div>
            </div>
            {/* Nickname */}
            <span className="font-semibold text-gray-900 text-sm">
              {comment.nickname || `사용자 ${comment.userId}`}
            </span>
          </div>
          {/* Edit/Delete Buttons */}
          {!isEditing && (canEdit || canDelete) && (
            <div className="flex items-center gap-1">
              {canEdit && (
                <button
                  onClick={handleEditStart}
                  disabled={isSubmitting}
                  className="p-1 text-gray-400 hover:text-blue-500 transition-colors rounded"
                  title="수정"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded"
                  title="삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
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
                className="h-7 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                취소
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleEditSubmit}
                disabled={isSubmitting || !editContent.trim()}
                className="h-7 text-xs"
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
          <p className="text-gray-700 text-sm whitespace-pre-wrap">
            {comment.content}
          </p>
        )}

        {/* Meta: Date + Actions */}
        {!isEditing && (
          <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100">
            {comment.createdAt && (
              <span className="text-gray-400 text-xs">
                {formatDate(comment.createdAt)}
              </span>
            )}
            <button
              onClick={handleLike}
              className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors text-xs"
            >
              <Heart
                className={`w-3.5 h-3.5 ${comment.isLiked ? "fill-red-500 text-red-500" : ""}`}
              />
              <span>{comment.likeCount}</span>
            </button>
            {!isReply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors text-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>답글</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Reply Form */}
      {showReplyForm && !isReply && (
        <div className="mt-2 ml-6">
          <CommentForm
            postId={postId}
            parentCommentId={comment.id}
            onSuccess={handleReplySuccess}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
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
    </div>
  );
}
