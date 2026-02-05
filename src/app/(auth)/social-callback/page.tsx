"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import SocialSignUpForm from "@/components/auth/SocialSignUpForm";
import {
  handleSocialLoginCallback,
  getSocialLoginReturnUrl,
  clearSocialLoginReturnUrl,
  type SocialProvider,
  type SocialAuthResponse,
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
  const [socialData, setSocialData] = useState<{
    provider: SocialProvider;
    providerUserId: string;
    email?: string;
  } | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      // URL에서 response 데이터 파싱 (백엔드가 리다이렉트할 때 추가한 쿼리 파라미터)
      const responseData = searchParams.get("data");
      const errorMsg = searchParams.get("error");

      if (errorMsg) {
        setStatus("error");
        setError(decodeURIComponent(errorMsg));
        return;
      }

      if (!responseData) {
        setStatus("error");
        setError("소셜 로그인 응답 데이터가 없습니다");
        return;
      }

      try {
        const response: SocialAuthResponse = JSON.parse(
          decodeURIComponent(responseData)
        );
        const result = handleSocialLoginCallback(response);

        if (result.type === "login") {
          // 기존 사용자 로그인 성공 - refreshUser 완료 후 리다이렉트
          await refreshUser();
          const returnUrl = getSocialLoginReturnUrl();
          clearSocialLoginReturnUrl();

          // 부모 창에 메시지 전송 (팝업인 경우)
          if (window.opener) {
            window.opener.postMessage(
              { type: "social_login_success", data: response.data },
              window.location.origin
            );
            window.close();
          } else {
            router.push(returnUrl);
          }
        } else if (result.type === "signup") {
          // 신규 사용자 - 회원가입 폼 표시
          setStatus("signup");
          setSocialData({
            provider: (result.data.data?.provider?.toLowerCase() ||
              "google") as SocialProvider,
            providerUserId: result.data.data?.providerUserId || "",
            email: result.data.data?.email,
          });
        }
      } catch (error) {
        console.error("소셜 로그인 콜백 처리 실패:", error);
        setStatus("error");
        setError(
          error instanceof Error
            ? error.message
            : "소셜 로그인 처리 중 오류가 발생했습니다"
        );
      }
    };

    processCallback();
  }, [searchParams, router, refreshUser]);

  const handleSignUpSuccess = async (userId: number) => {
    // 회원가입 후 자동 로그인 (백엔드에서 JWT 발급 필요)
    await refreshUser();
    clearSocialLoginReturnUrl();

    // 부모 창에 메시지 전송 (팝업인 경우)
    if (window.opener) {
      window.opener.postMessage(
        { type: "social_signup_success", userId },
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

  const handleSignUpError = (errorMessage: string) => {
    clearSocialLoginReturnUrl();

    // 부모 창에 메시지 전송 (팝업인 경우)
    if (window.opener) {
      window.opener.postMessage(
        { type: "social_signup_error", error: errorMessage },
        window.location.origin
      );
      window.close();
    } else {
      // 실패 UI 표시 후 메인으로 이동
      setError(errorMessage);
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
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200"
          >
            메인으로 이동
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
