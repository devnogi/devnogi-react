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

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm p-4">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center text-sm mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold mb-2">로그인</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>아이디</FormLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10" />
                    <FormControl>
                      <Input
                        placeholder="아이디를 입력하세요"
                        className="pl-10"
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
                  <FormLabel>비밀번호</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10" />
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호를 입력하세요"
                        className="pl-10 pr-10"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
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
                "w-full",
                !form.formState.isValid && "opacity-50",
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  로그인 중...
                </>
              ) : (
                "로그인"
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-6">
          <p className="text-sm">
            계정이 없으신가요?{" "}
            <Link href="/signup" className="font-medium">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
