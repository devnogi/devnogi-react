"use client";

import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import { type ReactNode, useRef } from "react";

export default function AuctionFilterDialog({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  const returnFocusRef = useRef<HTMLElement | null>(null);

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content
          aria-describedby={undefined}
          onOpenAutoFocus={() => {
            returnFocusRef.current =
              document.activeElement as HTMLElement | null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocusRef.current?.focus();
          }}
          className="fixed inset-x-0 bottom-0 z-50 flex h-[85dvh] max-h-[90dvh] flex-col overflow-hidden rounded-t-2xl border border-[var(--color-ds-neutral-tone)] bg-[var(--color-ds-card)] text-[var(--color-ds-text)] outline-none"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-ds-neutral-tone)] px-6 py-3">
            <Dialog.Title className="text-lg font-bold">필터</Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="필터 닫기"
                className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-[var(--color-ds-primary-50)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
