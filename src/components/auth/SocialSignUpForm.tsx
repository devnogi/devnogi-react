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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Upload, X, User } from "lucide-react";
import Image from "next/image";
import { clientAxios } from "@/lib/api/clients";
import { SocialProvider } from "@/lib/auth/socialAuth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const socialSignUpSchema = z.object({
  nickname: z
    .string()
    .min(2, { message: "닉네임은 2자 이상 입력해주세요" })
    .max(20, { message: "닉네임은 20자 이하로 입력해주세요" })
    .regex(/^[a-zA-Z0-9가-힣_]+$/, {
      message: "닉네임은 한글, 영문, 숫자, 언더스코어(_)만 사용 가능합니다",
    }),
  profileImage: z
    .custom<File>()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, "파일 크기는 5MB 이하여야 합니다")
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "JPG, JPEG, PNG, WEBP 파일만 업로드 가능합니다"
    )
    .optional(),
});

type SocialSignUpFormData = z.infer<typeof socialSignUpSchema>;

interface SocialSignUpFormProps {
  provider: SocialProvider;
  providerUserId: string;
  email?: string;
  onSuccess: (userId: number) => void;
  onError: (errorMessage: string) => void;
  onCancel: () => void;
}

export default function SocialSignUpForm({
  provider,
  providerUserId,
  email,
  onSuccess,
  onError,
  onCancel,
}: SocialSignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [nicknameCheckStatus, setNicknameCheckStatus] = useState<{
    checked: boolean;
    available: boolean;
    message: string;
  }>({ checked: false, available: false, message: "" });

  const form = useForm<SocialSignUpFormData>({
    resolver: zodResolver(socialSignUpSchema),
    defaultValues: {
      nickname: "",
      profileImage: undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("profileImage", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    form.setValue("profileImage", undefined);
    setPreviewUrl(null);
  };

  const checkNicknameAvailability = async () => {
    const nickname = form.getValues("nickname");
    if (!nickname || nickname.length < 2) {
      return;
    }

    try {
      const response = await clientAxios.get<{
        success: boolean;
        data: boolean;
        message?: string;
      }>(`/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`);

      if (response.data.success) {
        setNicknameCheckStatus({
          checked: true,
          available: response.data.data,
          message: response.data.data
            ? "사용 가능한 닉네임입니다"
            : "이미 사용 중인 닉네임입니다",
        });
      }
    } catch (error) {
      console.error("닉네임 중복 확인 실패:", error);
      setNicknameCheckStatus({
        checked: true,
        available: false,
        message: "닉네임 확인에 실패했습니다",
      });
    }
  };

  const onSubmit = async (data: SocialSignUpFormData) => {
    // 닉네임 중복 체크 확인
    if (!nicknameCheckStatus.checked || !nicknameCheckStatus.available) {
      alert("닉네임 중복 확인을 먼저 해주세요");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("provider", provider.toUpperCase());
      formData.append("providerUserId", providerUserId);
      formData.append("email", email || "");
      formData.append("nickname", data.nickname);

      if (data.profileImage) {
        formData.append("file", data.profileImage);
      }

      const response = await clientAxios.post<{
        success: boolean;
        data: { id: number };
      }>("/auth/signup/social", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        onSuccess(response.data.data.id);
      } else {
        throw new Error("회원가입에 실패했습니다");
      }
    } catch (error) {
      console.error("소셜 회원가입 실패:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "회원가입에 실패했습니다. 다시 시도해주세요.";
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderLabel = () => {
    switch (provider) {
      case "google":
        return "Google";
      case "kakao":
        return "카카오";
      case "naver":
        return "네이버";
      default:
        return provider;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {getProviderLabel()} 회원가입
        </h2>
        <p className="text-sm text-gray-600">
          추가 정보를 입력하여 회원가입을 완료해주세요
        </p>
        {email && <p className="text-xs text-gray-500 mt-1">이메일: {email}</p>}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* 프로필 이미지 */}
          <FormField
            control={form.control}
            name="profileImage"
            render={() => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-700">
                  프로필 이미지 (선택)
                </FormLabel>
                <FormControl>
                  <div className="flex flex-col items-center gap-4">
                    {previewUrl ? (
                      <div className="relative w-32 h-32">

                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-gray-200 shadow-sm relative">
                          <Image
                            src={previewUrl}
                            alt="Profile preview"
                            fill
                            className="object-cover"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-1 right-1 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg z-10 border-2 border-white"
                          title="이미지 삭제"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    )}

                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm font-medium">이미지 업로드</span>
                      </div>
                    </label>
                  </div>
                </FormControl>
                <FormDescription className="text-center text-xs">
                  JPG, PNG, WEBP 파일 (최대 5MB)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 닉네임 */}
          <FormField
            control={form.control}
            name="nickname"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-700">
                  닉네임 *
                </FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      placeholder="닉네임을 입력하세요"
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setNicknameCheckStatus({
                          checked: false,
                          available: false,
                          message: "",
                        });
                      }}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={checkNicknameAvailability}
                    disabled={!field.value || field.value.length < 2}
                    className="h-12 px-4 whitespace-nowrap"
                  >
                    중복확인
                  </Button>
                </div>
                {nicknameCheckStatus.checked && (
                  <p
                    className={`text-sm ${
                      nicknameCheckStatus.available
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {nicknameCheckStatus.message}
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 h-12"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !nicknameCheckStatus.checked ||
                !nicknameCheckStatus.available
              }
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  가입 중...
                </>
              ) : (
                "회원가입"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
