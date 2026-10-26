"use client";

import { useEffect, useState } from "react";
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
import { Loader2, Shuffle, Upload, X, User } from "lucide-react";
import Image from "next/image";
import { clientAxios } from "@/lib/api/clients";
import { SocialProvider } from "@/lib/auth/socialAuth";
import { NicknamePolicyHelp } from "@/components/auth/NicknamePolicyHelp";
import { useNicknameCandidate } from "@/hooks/useNicknameCandidate";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const socialSignUpSchema = z.object({
  nickname: z.string().min(1, { message: "닉네임을 다시 발급받아주세요" }),
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
const refreshSignupHint = "이전 화면이 열려 있다면 페이지를 새로고침해 최신 가입 화면에서 다시 시도해주세요.";

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
  const [nicknameSubmissionError, setNicknameSubmissionError] = useState<string | null>(null);
  const { candidate, status: nicknameStatus, error: nicknameError, refresh: refreshNickname } = useNicknameCandidate();

  const form = useForm<SocialSignUpFormData>({
    resolver: zodResolver(socialSignUpSchema),
    defaultValues: {
      nickname: "",
      profileImage: undefined,
    },
  });

  useEffect(() => {
    form.setValue("nickname", candidate?.nickname ?? "", { shouldValidate: true });
  }, [candidate, form]);

  const rerollNickname = () => {
    setNicknameSubmissionError(null);
    void refreshNickname();
  };

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

  const onSubmit = async (data: SocialSignUpFormData) => {
    if (nicknameStatus !== "ready" || !candidate ||
        data.nickname !== candidate.nickname || nicknameSubmissionError ||
        Date.parse(candidate.expiresAt) <= Date.now()) {
      onError("닉네임을 다시 발급받아주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("provider", provider.toUpperCase());
      formData.append("providerUserId", providerUserId);
      formData.append("email", email || "");
      formData.append("nickname", data.nickname);
      formData.append("nicknameTicket", candidate.nicknameTicket);

      if (data.profileImage) {
        formData.append("file", data.profileImage);
      }

      const response = await clientAxios.post<{
        success: boolean;
        data: { id: number };
      }>("/auth/signup/social", formData);

      if (response.data.success) {
        onSuccess(response.data.data.id);
      } else {
        throw new Error("회원가입에 실패했습니다");
      }
    } catch (error) {
      const response = (error as { response?: { status?: number; data?: { code?: string; message?: string } } }).response;
      const status = response?.status;
      if (status === 409) {
        setNicknameSubmissionError("닉네임이 중복되었습니다. 다시 뽑아주세요.");
        onError(`닉네임이 중복되었습니다. 다시 뽑아주세요. ${refreshSignupHint}`);
        return;
      }
      if (status === 400 && ["INVALID_NICKNAME_TICKET", "EXPIRED_NICKNAME_TICKET"].includes(response?.data?.code ?? "")) {
        setNicknameSubmissionError("닉네임 사용 시간이 지났거나 유효하지 않습니다. 다시 뽑아주세요.");
        onError(`${response?.data?.message || "닉네임 사용 시간이 지났거나 유효하지 않습니다."} 다시 뽑아주세요. ${refreshSignupHint}`);
        return;
      }
      if (status && status >= 400 && status < 500) {
        onError(`${response?.data?.message || "회원가입에 실패했습니다."} ${refreshSignupHint}`);
        return;
      }
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
                <div className="flex items-center gap-2">
                  <FormLabel className="text-sm font-semibold text-gray-700">닉네임 *</FormLabel>
                  <NicknamePolicyHelp />
                </div>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      placeholder={nicknameStatus === "loading" ? "닉네임을 발급받는 중..." : "닉네임을 발급받아주세요"}
                      className="h-12 border-gray-300 bg-gray-50 rounded-lg"
                      {...field}
                      readOnly
                      aria-describedby="social-nickname-status"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={rerollNickname}
                    disabled={nicknameStatus === "loading" || isLoading}
                    className="h-12 px-4 whitespace-nowrap"
                  >
                    {nicknameStatus === "loading" ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Shuffle className="mr-1 h-4 w-4" />}
                    다시 뽑기
                  </Button>
                </div>
                <FormDescription id="social-nickname-status" role="status" aria-live="polite">
                  {nicknameSubmissionError ?? nicknameError ??
                    (nicknameStatus === "loading" ? "새 닉네임을 불러오고 있습니다." : "인게임 인증 전에는 자동 생성된 닉네임만 사용할 수 있습니다.")}
                </FormDescription>
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
                nicknameStatus !== "ready" ||
                !candidate || !!nicknameSubmissionError
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
