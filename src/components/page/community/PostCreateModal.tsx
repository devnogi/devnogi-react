"use client";

import { X } from "lucide-react";

import PostComposer from "./PostComposer";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function PostCreateModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="새 게시글 작성"
    >
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="작성창 닫기"
      />
      <div className="relative max-h-[100dvh] w-full overflow-y-auto bg-white dark:bg-navy-800 sm:max-w-[680px] sm:rounded-2xl sm:border sm:border-gray-200 dark:sm:border-navy-600">
        <header className="flex h-14 items-center justify-between border-b border-gray-100 px-4 dark:border-navy-600">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            새 이야기
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-navy-700"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <PostComposer autoFocus onPosted={onClose} />
      </div>
    </div>
  );
}
