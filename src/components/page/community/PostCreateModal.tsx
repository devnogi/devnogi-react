"use client";

import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useRef } from "react";

import PostComposer from "./PostComposer";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function PostCreateModal({ isOpen, onClose }: Props) {
  const returnFocus = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35" />
        <Dialog.Content
          ref={contentRef}
          aria-label="새 게시글 작성"
          aria-labelledby={undefined}
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 max-h-[100dvh] w-full overflow-y-auto bg-white dark:bg-navy-800 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[calc(100dvh-3rem)] sm:max-w-[680px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:border-gray-200 dark:sm:border-navy-600"
          onOpenAutoFocus={(event) => {
            returnFocus.current = document.activeElement as HTMLElement | null;
            const textarea = contentRef.current?.querySelector("textarea");
            if (textarea) {
              event.preventDefault();
              textarea.focus();
            }
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (returnFocus.current?.isConnected) returnFocus.current.focus();
          }}
        >
          <header className="flex h-14 items-center justify-between border-b border-gray-100 px-4 dark:border-navy-600">
            <Dialog.Title className="font-semibold text-gray-900 dark:text-white">
              새 이야기
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-navy-700"
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </header>
          <PostComposer onPosted={onClose} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
