"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import SocialSignUpForm from "@/components/auth/SocialSignUpForm";
import { useAuth } from "@/contexts/AuthContext";
import {
  clearPendingSocialSignup,
  clearSocialLoginReturnUrl,
  getPendingSocialSignup,
  type PendingSocialSignup,
} from "@/lib/auth/socialAuth";

export default function SocialSignUpPage() {
  const { replace } = useRouter();
  const { refreshUser } = useAuth();
  const [signup, setSignup] = useState<PendingSocialSignup | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const pendingSignup = getPendingSocialSignup();
    if (!pendingSignup) {
      replace("/sign-in");
      return;
    }
    setSignup(pendingSignup);
    setChecking(false);
  }, [replace]);

  const finish = async () => {
    clearPendingSocialSignup();
    clearSocialLoginReturnUrl();
    await refreshUser();

    if (window.opener) {
      window.opener.postMessage(
        { type: "social_signup_success" },
        window.location.origin,
      );
      window.close();
    } else {
      replace("/");
    }
  };

  const cancel = () => {
    clearPendingSocialSignup();
    clearSocialLoginReturnUrl();
    if (window.opener) {
      window.opener.postMessage(
        { type: "social_login_cancel" },
        window.location.origin,
      );
      window.close();
    } else {
      replace("/sign-in");
    }
  };

  const fail = () => {
    clearPendingSocialSignup();
    clearSocialLoginReturnUrl();
    replace("/sign-in");
  };

  if (checking || !signup) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-4 text-foreground">
        <Loader2 className="size-12 animate-spin text-primary" />
        <span className="sr-only">가입 정보를 확인하는 중...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4 text-foreground">
      <SocialSignUpForm
        provider={signup.provider}
        email={signup.email}
        signupProof={signup.signupProof}
        onSuccess={finish}
        onError={fail}
        onCancel={cancel}
      />
    </div>
  );
}
