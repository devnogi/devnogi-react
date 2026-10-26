"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { clientAxios } from "@/lib/api/clients";
import SocialSignUpForm from "@/components/auth/SocialSignUpForm";
import {
  handleSocialLoginCallback,
  getSocialLoginReturnUrl,
  clearSocialLoginReturnUrl,
  type SocialProvider,
  type SocialAuthResponse,
  type SocialExchangeResult,
} from "@/lib/auth/socialAuth";
import { useAuth } from "@/contexts/AuthContext";

function SocialCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<
    "loading" | "signup" | "success" | "error"
  >("loading");
  const [error, setError] = useState<string>("");
  const handled = useRef(false);
  const [socialData, setSocialData] = useState<{
    provider: SocialProvider;
    providerUserId?: string;
    email?: string;
    signupProof?: string;
  } | null>(null);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const code = searchParams.get("code");
    const responseData = searchParams.get("data");
    const errorMsg = searchParams.get("error");
    // code와 구형 data는 다른 비동기 작업보다 먼저 브라우저 기록에서 제거한다.
    window.history.replaceState(window.history.state, "", window.location.pathname);

    if (errorMsg) {
      setStatus("error");
      setError("소셜 인증에 실패했습니다. 다시 시도해주세요.");
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

      if (window.opener) {
        window.opener.postMessage(
          { type: "social_login_success" },
          window.location.origin
        );
        window.close();
      } else {
        router.push(returnUrl);
      }
    };

    const handleCallback = async () => {
      if (code) {
        const response = await clientAxios.post<{ success: boolean; data: SocialExchangeResult }>(
          "/auth/oauth/exchange", { code }
        );
        const result = response.data.data;
        if (!response.data.success || !result) throw new Error("Invalid exchange response");
        if (result.type === "LOGIN_SUCCESS") {
          await finishLogin();
          return;
        }
        if (result.type !== "SIGNUP_REQUIRED" || !result.signupProof) {
          throw new Error("Invalid signup exchange response");
        }
        const provider = result.provider.toLowerCase();
        if (provider !== "google" && provider !== "kakao" && provider !== "naver") {
          throw new Error("Unsupported social provider");
        }
        setStatus("signup");
        setSocialData({
          provider,
          email: result.email,
          signupProof: result.signupProof,
        });
        return;
      }

      // 구형 Auth가 남아 있는 짧은 전환 기간에만 이전 응답을 소비한다.
      const response = JSON.parse(responseData as string) as SocialAuthResponse;
      const result = handleSocialLoginCallback(response);
      if (result.type === "login") {
        await finishLogin();
      } else {
        const providerUserId = result.data.data?.providerUserId;
        if (!providerUserId) throw new Error("Missing legacy provider identity");
        setStatus("signup");
        setSocialData({
          provider: (result.data.data?.provider?.toLowerCase() || "google") as SocialProvider,
          providerUserId,
          email: result.data.data?.email,
        });
      }
    };

    void handleCallback().catch(() => {
      setStatus("error");
      setError("소셜 인증 정보가 만료되었거나 유효하지 않습니다. 페이지를 새로고침하고 다시 시도해주세요.");
    });
  }, [searchParams, router, refreshUser]);

  const handleSignUpSuccess = async () => {
    // 회원가입 후 자동 로그인 (백엔드에서 JWT 발급 필요)
    await refreshUser();
    clearSocialLoginReturnUrl();

    // 부모 창에 메시지 전송 (팝업인 경우)
    if (window.opener) {
      window.opener.postMessage(
        { type: "social_signup_success" },
        window.location.origin
      );
      window.close();
    } else {
      // 성공 UI 표시 후 메인으로 이동
      setStatus("success");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
  };

  const handleSignUpError = () => {
    clearSocialLoginReturnUrl();

    // 부모 창에 메시지 전송 (팝업인 경우)
    if (window.opener) {
      window.opener.postMessage(
        { type: "social_signup_error" },
        window.location.origin
      );
      window.close();
    } else {
      // 실패 UI 표시 후 메인으로 이동
      setError("회원가입을 완료하지 못했습니다. 페이지를 새로고침하고 다시 시도해주세요.");
      setStatus("error");
    }
  };

  const handleCancel = () => {
    clearSocialLoginReturnUrl();

    if (window.opener) {
      window.opener.postMessage(
        { type: "social_login_cancel" },
        window.location.origin
      );
      window.close();
    } else {
      router.push("/");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">소셜 로그인 처리 중...</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            회원가입 완료
          </h2>
          <p className="text-gray-600 mb-6">
            환영합니다! 잠시 후 메인 화면으로 이동합니다.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200"
          >
            메인으로 이동
          </button>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            회원가입 실패
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleCancel}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  if (status === "signup" && socialData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <SocialSignUpForm
          provider={socialData.provider}
          providerUserId={socialData.providerUserId}
          email={socialData.email}
          signupProof={socialData.signupProof}
          onSuccess={handleSignUpSuccess}
          onError={handleSignUpError}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return null;
}

export default function SocialCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <SocialCallbackContent />
    </Suspense>
  );
}
