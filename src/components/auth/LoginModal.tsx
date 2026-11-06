"use client";

import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useCallback, useEffect, useRef } from "react";

import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { clearSocialLoginReturnUrl } from "@/lib/auth/socialAuth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: LoginModalProps) {
  const { refreshUser } = useAuth();
  const returnFocus = useRef<HTMLElement | null>(null);

  const handleSocialLoginMessage = useCallback(
    async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data.type === "social_login_cancel") {
        clearSocialLoginReturnUrl();
        return;
      }
      if (
        event.data.type !== "social_login_success" &&
        event.data.type !== "social_signup_success"
      ) {
        return;
      }

      clearSocialLoginReturnUrl();
      await refreshUser();
      onLoginSuccess?.();
      onClose();
    },
    [onClose, onLoginSuccess, refreshUser],
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("message", handleSocialLoginMessage);
    return () =>
      window.removeEventListener("message", handleSocialLoginMessage);
  }, [handleSocialLoginMessage, isOpen]);

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-2xl md:p-8"
          onOpenAutoFocus={() => {
            returnFocus.current = document.activeElement as HTMLElement | null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (
              !document.querySelector('[role="dialog"][data-state="open"]') &&
              returnFocus.current?.isConnected
            )
              returnFocus.current.focus();
          }}
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <Dialog.Title className="text-2xl font-bold text-foreground">
                로그인
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                소셜 계정으로 메모노기를 이용하세요.
              </Dialog.Description>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11"
              onClick={onClose}
              aria-label="로그인 창 닫기"
            >
              <X />
            </Button>
          </div>

          <SocialLoginButtons />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
