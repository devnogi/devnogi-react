"use client";

import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

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
import { useAuth } from "@/contexts/AuthContext";
import { clientAxios } from "@/lib/api/clients";
import {
  clearPendingSocialSignup,
  clearSocialLoginReturnUrl,
  getSocialLoginReturnUrl,
  handleSocialLoginCallback,
  savePendingSocialSignup,
  type SocialAuthResponse,
  type SocialExchangeResult,
  type SocialProvider,
} from "@/lib/auth/socialAuth";

interface SignupConfirmation {
  provider: SocialProvider;
  email?: string;
  signupProof: string;
  createdAt: number;
}

const SOCIAL_AUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_account_exists:
    "이미 다른 로그인 방식으로 가입된 이메일입니다. 기존에 사용한 로그인 방식으로 로그인해주세요.",
};

function getSocialAuthErrorMessage(errorCode: string) {
  return (
    SOCIAL_AUTH_ERROR_MESSAGES[errorCode] ??
    "소셜 인증에 실패했습니다. 다시 시도해주세요."
  );
}

function SocialCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "confirm" | "error">(
    "loading",
  );
  const [error, setError] = useState("");
  const [signup, setSignup] = useState<SignupConfirmation | null>(null);
  const handled = useRef(false);

  const cancelSignup = () => {
    clearPendingSocialSignup();
    clearSocialLoginReturnUrl();
    if (window.opener) {
      window.opener.postMessage(
        { type: "social_login_cancel" },
        window.location.origin,
      );
      window.close();
    } else {
      router.replace("/sign-in");
    }
  };

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const code = searchParams.get("code");
    const responseData = searchParams.get("data");
    const errorCode = searchParams.get("error");
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname,
    );

    if (errorCode) {
      setStatus("error");
      setError(getSocialAuthErrorMessage(errorCode));
      return;
    }
    if (!code && !responseData) {
      setStatus("error");
      setError("소셜 로그인 응답 데이터가 없습니다. 다시 시도해주세요.");
      return;
    }

    const finishLogin = async () => {
      await refreshUser();
      const returnUrl = getSocialLoginReturnUrl();
      clearSocialLoginReturnUrl();
      clearPendingSocialSignup();

      if (window.opener) {
        window.opener.postMessage(
          { type: "social_login_success" },
          window.location.origin,
        );
        window.close();
      } else {
        router.push(returnUrl);
      }
    };

    const handleCallback = async () => {
      if (code) {
        const response = await clientAxios.post<{
          success: boolean;
          data: SocialExchangeResult;
        }>("/auth/oauth/exchange", { code });
        const result = response.data.data;
        if (!response.data.success || !result) {
          throw new Error("Invalid exchange response");
        }
        if (result.type === "LOGIN_SUCCESS") {
          await finishLogin();
          return;
        }
        if (result.type !== "SIGNUP_REQUIRED" || !result.signupProof) {
          throw new Error("Invalid signup exchange response");
        }

        const provider = result.provider.toLowerCase();
        if (
          provider !== "google" &&
          provider !== "kakao" &&
          provider !== "naver"
        ) {
          throw new Error("Unsupported social provider");
        }

        setSignup({
          provider,
          email: result.email,
          signupProof: result.signupProof,
          createdAt: Date.now(),
        });
        setStatus("confirm");
        return;
      }

      const response = JSON.parse(responseData as string) as SocialAuthResponse;
      const result = handleSocialLoginCallback(response);
      if (result.type === "login") {
        await finishLogin();
        return;
      }
      throw new Error("Legacy social signup is no longer supported");
    };

    void handleCallback().catch(() => {
      clearPendingSocialSignup();
      setStatus("error");
      setError(
        "소셜 인증 정보가 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.",
      );
    });
  }, [refreshUser, router, searchParams]);

  const continueSignup = () => {
    if (!signup) return;
    savePendingSocialSignup(signup);
    router.replace("/sign-up");
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-4 text-foreground">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 size-12 animate-spin text-primary" />
          <p className="text-muted-foreground">소셜 로그인 처리 중...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-4 text-foreground">
        <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-lg border border-border bg-card p-8 text-center">
          <h1 className="text-xl font-bold">소셜 인증 실패</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button type="button" onClick={cancelSignup}>
            로그인으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4 text-foreground">
      <p className="text-muted-foreground">회원 여부를 확인했습니다.</p>
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>회원가입 안내</AlertDialogTitle>
            <AlertDialogDescription>
              회원이 아닙니다. 회원 가입하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelSignup}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={continueSignup}>
              회원가입
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function SocialCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background p-4 text-foreground">
          <Loader2 className="size-12 animate-spin text-primary" />
          <span className="sr-only">로딩 중...</span>
        </div>
      }
    >
      <SocialCallbackContent />
    </Suspense>
  );
}
