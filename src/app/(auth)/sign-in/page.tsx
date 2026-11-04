"use client";

import clsx from "clsx";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { useAuth } from "@/contexts/AuthContext";
import { clearSocialLoginReturnUrl } from "@/lib/auth/socialAuth";

import panelStyles from "../AuthPanel.module.css";

export default function Page() {
  const router = useRouter();
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
      router.push("/");
    },
    [refreshUser, router],
  );

  useEffect(() => {
    window.addEventListener("message", handleSocialLoginMessage);
    return () =>
      window.removeEventListener("message", handleSocialLoginMessage);
  }, [handleSocialLoginMessage]);

  return (
    <div className="h-dvh overflow-hidden bg-background text-foreground">
      <div className="flex h-full md:mx-auto md:max-w-5xl md:px-4 md:py-4 lg:px-6 lg:py-6">
        <div className="flex min-h-0 w-full overflow-hidden bg-card md:rounded-lg md:border md:border-border">
          <aside
            className={clsx(
              panelStyles.library,
              "hidden w-[42%] min-w-[320px] flex-col justify-between bg-stone-800 bg-cover bg-center bg-blend-multiply p-8 text-white md:flex",
            )}
          >
            <div className="flex flex-col gap-4">
              <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium">
                <Sparkles className="size-4" />
                메모노기
              </p>
              <h2 className="text-3xl font-bold leading-tight">
                마비노기 정보를
                <br />더 빠르게 확인하세요.
              </h2>
              <p className="text-sm text-white/85">
                로그인 후 경매장 분석, 실시간 데이터, 커뮤니티 활동을 바로
                이용할 수 있습니다.
              </p>
            </div>
            <div className="rounded-lg border border-white/20 bg-black/10 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="size-4" />
                안전한 계정 연결
              </p>
              <p className="mt-1 text-xs text-white/80">
                메모노기는 공식 사이트가 아닌 NEXON OPEN API 기반 비공식
                서비스입니다.
              </p>
            </div>
          </aside>

          <main className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5 sm:p-8">
            <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 py-10 sm:py-12">
              <header>
                <Link
                  href="/"
                  className="mb-4 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="mr-2 size-4" />
                  홈으로 돌아가기
                </Link>
                <h1 className="text-2xl font-semibold text-foreground">
                  소셜 계정으로 시작하기
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  사용하실 소셜 계정을 선택해 로그인하거나 가입하세요.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  메모노기는 NEXON OPEN API를 활용한 비공식 커뮤니티
                  서비스입니다.
                </p>
              </header>

              <SocialLoginButtons />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
