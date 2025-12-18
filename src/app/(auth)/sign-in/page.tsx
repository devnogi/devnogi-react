"use client";

import { useState } from "react";
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
import { Eye, EyeOff, Lock, ArrowLeft, User, Loader2 } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

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

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      id: "",
      password: "",
    },
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
    // 소셜 로그인 시작
    import("@/lib/auth/socialAuth").then(({ initiateSocialLogin }) => {
      initiateSocialLogin(provider);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white md:bg-gradient-to-br md:from-blue-50 md:via-white md:to-purple-50">
      <div className="w-full max-w-md p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            환영합니다
          </h1>
          <p className="text-gray-600 text-sm">DevNogi에 로그인하세요</p>
        </div>

        {/* Login Card */}
        <div className="bg-white md:rounded-2xl md:shadow-xl md:border md:border-gray-100 p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      아이디
                    </FormLabel>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                      <FormControl>
                        <Input
                          placeholder="아이디를 입력하세요"
                          className="pl-11 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
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
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      비밀번호
                    </FormLabel>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="비밀번호를 입력하세요"
                          className="pl-11 pr-11 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className={clsx(
                  "w-full h-12 mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]",
                  !form.formState.isValid && "opacity-50",
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    로그인 중...
                  </>
                ) : (
                  "로그인"
                )}
              </Button>
            </form>
          </Form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">또는</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              className="w-full h-12 flex items-center justify-center gap-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
            >
              <GoogleIcon />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                Google로 계속하기
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin("kakao")}
              className="w-full h-12 flex items-center justify-center gap-3 bg-[#FEE500] rounded-lg hover:bg-[#FDD835] transition-colors duration-200 group"
            >
              <KakaoIcon />
              <span className="text-sm font-medium text-[#3C1E1E] group-hover:text-black">
                카카오로 계속하기
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin("naver")}
              className="w-full h-12 flex items-center justify-center gap-3 bg-[#03C75A] rounded-lg hover:bg-[#02B350] transition-colors duration-200 group"
            >
              <NaverIcon />
              <span className="text-sm font-medium text-white">
                네이버로 계속하기
              </span>
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
