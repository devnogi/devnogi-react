"use client";

import { X } from "lucide-react";
import { useCallback, useEffect } from "react";

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-4 md:p-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="social-login-title"
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl md:p-8"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2
              id="social-login-title"
              className="text-2xl font-bold text-foreground"
            >
              로그인
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              소셜 계정으로 메모노기를 이용하세요.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="로그인 창 닫기"
          >
            <X />
          </Button>
        </div>

        <SocialLoginButtons />
      </div>
    </div>
  );
}
