"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { clientAxios } from "@/lib/api/clients";
import { toast } from "sonner";

interface CommentFormProps {
  postId: string;
  parentCommentId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CommentForm({
  postId,
  parentCommentId,
  onSuccess,
  onCancel,
}: CommentFormProps) {
  const { isAuthenticated } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.warning("로그인 후 사용 가능합니다.");
      return;
    }

    if (!content.trim()) return;

    setIsSubmitting(true);

    try {
      await clientAxios.post(`/comments/${postId}`, {
        content: content.trim(),
        parentComment: parentCommentId ?? null,
      });

      setContent("");
      toast.success("댓글이 작성되었습니다.");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to submit comment:", error);
      toast.error("댓글 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisabledClick = () => {
    if (!isAuthenticated) {
      toast.warning("로그인 후 사용 가능합니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onClick={!isAuthenticated ? handleDisabledClick : undefined}
        placeholder={
          !isAuthenticated
            ? "로그인 후 댓글을 작성할 수 있습니다."
            : parentCommentId
              ? "답글을 작성하세요..."
              : "댓글을 작성하세요..."
        }
        className={`w-full px-4 py-3 border border-gray-200 dark:border-navy-500 rounded-xl bg-white dark:bg-navy-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-ds-primary)]/20 focus:border-[var(--color-ds-primary)] resize-none ${
          !isAuthenticated ? "bg-gray-100 dark:bg-navy-700 cursor-not-allowed" : ""
        }`}
        rows={parentCommentId ? 2 : 3}
        disabled={isSubmitting || !isAuthenticated}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-xl"
          >
            취소
          </Button>
        )}
        <Button
          type={isAuthenticated ? "submit" : "button"}
          size="sm"
          disabled={isSubmitting || (isAuthenticated && !content.trim())}
          onClick={!isAuthenticated ? handleDisabledClick : undefined}
          className={`rounded-xl ${
            !isAuthenticated
              ? "opacity-50 saturate-50 cursor-not-allowed"
              : ""
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              작성 중...
            </>
          ) : (
            "작성"
          )}
        </Button>
      </div>
    </form>
  );
}
