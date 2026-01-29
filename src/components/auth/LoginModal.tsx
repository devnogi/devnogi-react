"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
  Mail,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useConfig } from "@/contexts/ConfigContext";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "이메일을 입력해주세요" })
    .email({ message: "올바른 이메일 형식이 아닙니다" }),
  password: z
    .string()
    .min(6, { message: "비밀번호는 6자 이상 입력해주세요" })
    .max(50, { message: "비밀번호는 50자 이하로 입력해주세요" }),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

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

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { login, refreshUser } = useAuth();
  const { config, isLoading: isConfigLoading } = useConfig();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      await login(data.email, data.password, data.rememberMe);
      onLoginSuccess?.();
      onClose();
    } catch (error) {
      console.error("로그인 실패:", error);
      alert(error instanceof Error ? error.message : "로그인에 실패했습니다");
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
      initiateSocialLogin(provider, config.gatewayUrl);
    });

    // 소셜 로그인 완료 메시지 수신 대기
    const messageHandler = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === "social_login_success") {
        // 로그인 성공 - 사용자 정보 갱신
        await refreshUser();
        onLoginSuccess?.();
        onClose();
        window.removeEventListener("message", messageHandler);
      } else if (event.data.type === "social_signup_success") {
        // 회원가입 후 로그인 성공 - 사용자 정보 갱신
        await refreshUser();
        onLoginSuccess?.();
        onClose();
        window.removeEventListener("message", messageHandler);
      } else if (event.data.type === "social_login_cancel") {
        // 취소됨
        window.removeEventListener("message", messageHandler);
      }
    };

    window.addEventListener("message", messageHandler);
  };

  const clearField = (fieldName: "email" | "password") => {
    form.setValue(fieldName, "");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50 p-4 md:p-8">
      <div className="bg-white md:rounded-2xl md:shadow-2xl md:border md:border-gray-100 p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            로그인
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    이메일
                  </FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@email.com"
                        className="pl-11 pr-11 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        {...field}
                      />
                    </FormControl>
                    {field.value && (
                      <button
                        type="button"
                        onClick={() => clearField("email")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
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
                        className="pl-11 pr-20 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        {...field}
                      />
                    </FormControl>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 flex items-center gap-1">
                      {field.value && (
                        <button
                          type="button"
                          onClick={() => clearField("password")}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal text-gray-700 cursor-pointer">
                    자동 로그인
                  </FormLabel>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className={clsx(
                "w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]",
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

        {/* Links */}
        <div className="flex items-center justify-center gap-4 mt-4 text-sm">
          <Link
            href="/sign-up"
            className="text-gray-600 hover:text-gray-900 transition-colors"
            onClick={onClose}
          >
            회원가입
          </Link>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={() => {}}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            아이디/비밀번호 찾기
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-6">
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
    </div>
  );
}
