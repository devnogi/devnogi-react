"use client";

import { useState, useEffect, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Eye,
  EyeOff,
  Lock,
  ArrowLeft,
  User,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { useConfig } from "@/contexts/ConfigContext";
import { useAuth } from "@/contexts/AuthContext";

const loginSchema = z.object({
  // TODO: validation 조건 확인
  id: z
    .string()
    .min(2, { message: "아이디는 2자 이상 입력해주세요" })
    .max(20, { message: "아이디는 20자 이하로 입력해주세요" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "아이디는 영문, 숫자, 언더스코어(_)만 사용 가능합니다",
    }),
  password: z
    .string()
    .min(6, { message: "비밀번호는 6자 이상 입력해주세요" })
    .max(50, { message: "비밀번호는 50자 이하로 입력해주세요" })
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, {
      message: "비밀번호는 영문과 숫자를 포함해야 합니다",
    }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const KakaoIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path
      fill="#3C1E1E"
      d="M12 3C6.486 3 2 6.462 2 10.8c0 2.775 1.858 5.21 4.665 6.563l-.892 3.245a.5.5 0 00.725.579l3.996-2.664A11.97 11.97 0 0012 18.6c5.514 0 10-3.462 10-7.8S17.514 3 12 3z"
    />
  </svg>
);

const NaverIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#03C75A" d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
  </svg>
);

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { config, isLoading: isConfigLoading } = useConfig();
  const { refreshUser } = useAuth();

  // 소셜 로그인 성공 메시지 핸들러
  const handleSocialLoginMessage = useCallback(
    async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (
        event.data.type === "social_login_success" ||
        event.data.type === "social_signup_success"
      ) {
        // 사용자 정보 갱신
        await refreshUser();
        // 메인 페이지로 이동
        router.push("/");
      }
      // social_login_cancel은 별도 처리 불필요
    },
    [refreshUser, router]
  );

  // 메시지 리스너 등록
  useEffect(() => {
    window.addEventListener("message", handleSocialLoginMessage);
    return () => {
      window.removeEventListener("message", handleSocialLoginMessage);
    };
  }, [handleSocialLoginMessage]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      id: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      // TODO: 실제 로그인 로직 구현
      console.warn("로그인 시도:", data);

      // 로그인중...
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const referrer = document.referrer;
      let returnUrl = "/";

      if (referrer && referrer !== window.location.href) {
        try {
          // 상대 URL도 처리
          returnUrl = new URL(referrer, window.location.href).pathname;
        } catch {
          // 파싱 실패 시 안전 기본값
          returnUrl = "/";
        }
      }

      window.history.replaceState(null, "", returnUrl);
      router.push(returnUrl);
    } catch (error) {
      console.error("로그인 실패:", error);
      // TODO: 에러 처리
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: "google" | "kakao" | "naver") => {
    if (isConfigLoading || !config) {
      console.error("Config is not loaded yet");
      return;
    }

    // 소셜 로그인 시작
    import("@/lib/auth/socialAuth").then(({ initiateSocialLogin }) => {
      initiateSocialLogin(provider, config.socialAuthBaseUrl);
    });
  };

  const isSocialDisabled = isConfigLoading || !config;
  const socialButtonBaseClass =
    "w-full h-12 flex items-center justify-center gap-3 rounded-xl transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="h-dvh overflow-hidden bg-gradient-to-b from-cream-100 via-cream-50 to-white">
      <div className="mx-auto flex h-full max-w-5xl px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex min-h-0 w-full overflow-hidden rounded-3xl border border-cream-200/70 bg-white/95 shadow-[0_20px_60px_rgba(31,41,55,0.10)] backdrop-blur-sm">
          <aside className="hidden w-[42%] min-w-[320px] flex-col justify-between bg-gradient-to-br from-clover-700 via-clover-600 to-clover-500 p-8 text-white md:flex">
            <div className="space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium">
                <Sparkles className="h-4 w-4" />
                메모노기
              </p>
              <h2 className="text-3xl font-bold leading-tight">
                마비노기 정보를
                <br />
                더 빠르게 확인하세요.
              </h2>
              <p className="text-sm text-white/85">
                로그인 후 경매장 분석, 실시간 데이터, 커뮤니티 활동을 바로 이용할
                수 있습니다.
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-black/10 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="h-4 w-4" />
                안전한 계정 연결
              </p>
              <p className="mt-1 text-xs text-white/80">
                메모노기는 공식 사이트가 아닌 NEXON OPEN API 기반 비공식
                서비스입니다.
              </p>
            </div>
          </aside>

          <main className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5 sm:p-8">
            <div className="mx-auto w-full max-w-md">
              <header className="mb-6">
                <Link
                  href="/"
                  className="mb-4 inline-flex items-center text-sm text-cream-600 transition-colors hover:text-cream-900"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  홈으로 돌아가기
                </Link>
                <h1 className="text-3xl font-bold text-clover-700">로그인</h1>
                <p className="mt-2 text-sm text-cream-600">
                  계정 정보를 입력하고 메모노기를 시작하세요.
                </p>
                <p className="mt-1 text-xs text-cream-500">
                  메모노기는 NEXON OPEN API를 활용한 비공식 커뮤니티 서비스입니다.
                </p>
              </header>

              <div className="rounded-2xl border border-cream-200 bg-white p-5 shadow-[0_8px_24px_rgba(61,56,47,0.08)] sm:p-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-cream-800">
                            아이디
                          </FormLabel>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-cream-400" />
                            <FormControl>
                              <Input
                                placeholder="아이디를 입력하세요"
                                className="h-12 rounded-xl border-cream-300 pl-11 focus:border-clover-500 focus:ring-clover-500/20"
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-cream-800">
                            비밀번호
                          </FormLabel>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-cream-400" />
                            <FormControl>
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="비밀번호를 입력하세요"
                                className="h-12 rounded-xl border-cream-300 pl-11 pr-11 focus:border-clover-500 focus:ring-clover-500/20"
                                {...field}
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-cream-400 transition-colors hover:text-cream-600"
                              aria-label={
                                showPassword
                                  ? "비밀번호 숨기기"
                                  : "비밀번호 보기"
                              }
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isLoading || !form.formState.isValid}
                      className={clsx(
                        "mt-2 h-12 w-full rounded-xl bg-clover-600 font-semibold text-white shadow-[0_2px_8px_rgba(37,99,235,0.25)] transition-all duration-200 hover:bg-clover-700 hover:shadow-[0_4px_16px_rgba(37,99,235,0.35)]",
                        !form.formState.isValid && "opacity-60",
                      )}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          로그인 중...
                        </>
                      ) : (
                        "로그인"
                      )}
                    </Button>
                  </form>
                </Form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-cream-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-cream-500">또는</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("google")}
                    disabled={isSocialDisabled}
                    className={clsx(
                      socialButtonBaseClass,
                      "group border border-cream-300 hover:bg-cream-50",
                    )}
                  >
                    <GoogleIcon />
                    <span className="text-sm font-medium text-cream-700 group-hover:text-cream-900">
                      Google로 계속하기
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialLogin("kakao")}
                    disabled={isSocialDisabled}
                    className={clsx(
                      socialButtonBaseClass,
                      "group bg-[#FEE500] hover:bg-[#FDD835]",
                    )}
                  >
                    <KakaoIcon />
                    <span className="text-sm font-medium text-[#3C1E1E] group-hover:text-black">
                      카카오로 계속하기
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialLogin("naver")}
                    disabled={isSocialDisabled}
                    className={clsx(
                      socialButtonBaseClass,
                      "group bg-[#03C75A] hover:bg-[#02B350]",
                    )}
                  >
                    <NaverIcon />
                    <span className="text-sm font-medium text-white">
                      네이버로 계속하기
                    </span>
                  </button>
                </div>
              </div>

              <div className="mt-5 text-center">
                <p className="text-sm text-cream-600">
                  계정이 없으신가요?{" "}
                  <Link
                    href="/sign-up"
                    className="font-semibold text-clover-600 transition-colors hover:text-clover-700"
                  >
                    회원가입
                  </Link>
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
