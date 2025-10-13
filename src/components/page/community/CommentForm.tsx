"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    setIsSubmitting(true);

    try {
      // TODO: Implement comment submission
      // await clientAxios.post(`/posts/${postId}/comments`, {
      //   content,
      //   parentCommentId,
      // });

      setContent("");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          parentCommentId ? "답글을 작성하세요..." : "댓글을 작성하세요..."
        }
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        rows={parentCommentId ? 2 : 3}
        disabled={isSubmitting}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            취소
          </Button>
        )}
        <Button type="submit" size="sm" disabled={isSubmitting || !content.trim()}>
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
