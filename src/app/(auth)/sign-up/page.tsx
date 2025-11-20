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
  FormDescription,
} from "@/components/ui/form";
import {
  Eye,
  EyeOff,
  Lock,
  ArrowLeft,
  User,
  Loader2,
  Mail,
  CheckCircle2,
  XCircle,
  Camera,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import Image from "next/image";
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from "@/components/page/auth/TermsOfService";

const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "이메일은 필수 입력 항목입니다" })
      .email({ message: "올바른 이메일 형식이 아닙니다" }),
    password: z
      .string()
      .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다" })
      .max(30, { message: "비밀번호는 최대 30자까지 가능합니다" })
      .regex(/[A-Za-z]/, { message: "영문자를 포함해야 합니다" })
      .regex(/\d/, { message: "숫자를 포함해야 합니다" })
      .regex(/[@$!%*#?&]/, {
        message: "특수문자(@$!%*#?&)를 포함해야 합니다",
      }),
    passwordConfirm: z.string().min(1, { message: "비밀번호 확인은 필수입니다" }),
    nickname: z
      .string()
      .min(2, { message: "닉네임은 최소 2자 이상이어야 합니다" })
      .max(20, { message: "닉네임은 최대 20자까지 가능합니다" })
      .regex(/^[가-힣a-zA-Z0-9]{2,20}$/, {
        message: "한글, 영문, 숫자만 사용 가능합니다 (2-20자)",
      }),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "이용약관에 동의해주세요",
    }),
    agreePrivacy: z.boolean().refine((val) => val === true, {
      message: "개인정보처리방침에 동의해주세요",
    }),
    agreeMarketing: z.boolean().optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["passwordConfirm"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [termsContent, setTermsContent] = useState("");
  const [emailCheckStatus, setEmailCheckStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle");
  const [nicknameCheckStatus, setNicknameCheckStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      nickname: "",
      agreeTerms: false,
      agreePrivacy: false,
      agreeMarketing: false,
    },
    mode: "onChange",
  });

  const password = form.watch("password");

  // 비밀번호 강도 검사
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[@$!%*#?&]/.test(pwd)) strength++;

    if (strength <= 2)
      return { strength, label: "약함", color: "bg-red-500" };
    if (strength <= 3)
      return { strength, label: "보통", color: "bg-yellow-500" };
    return { strength, label: "강함", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  const checkEmailAvailability = async (email: string) => {
    if (!email || !email.match(/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/)) {
      setEmailCheckStatus("idle");
      return;
    }

    setEmailCheckStatus("checking");
    try {
      const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (data.success && data.data === true) {
        setEmailCheckStatus("available");
      } else {
        setEmailCheckStatus("unavailable");
      }
    } catch (error) {
      console.error("이메일 중복 확인 실패:", error);
      setEmailCheckStatus("idle");
    }
  };

  const checkNicknameAvailability = async (nickname: string) => {
    if (!nickname || !nickname.match(/^[가-힣a-zA-Z0-9]{2,20}$/)) {
      setNicknameCheckStatus("idle");
      return;
    }

    setNicknameCheckStatus("checking");
    try {
      const response = await fetch(`/api/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`);
      const data = await response.json();

      if (data.success && data.data === true) {
        setNicknameCheckStatus("available");
      } else {
        setNicknameCheckStatus("unavailable");
      }
    } catch (error) {
      console.error("닉네임 중복 확인 실패:", error);
      setNicknameCheckStatus("idle");
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("파일 크기는 5MB 이하만 가능합니다");
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: SignUpFormData) => {
    // 이메일, 닉네임 중복 체크 확인
    if (emailCheckStatus !== "available") {
      alert("이메일 중복 확인을 해주세요");
      return;
    }

    if (nicknameCheckStatus !== "available") {
      alert("닉네임 중복 확인을 해주세요");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("nickname", data.nickname);

      if (profileImage) {
        formData.append("file", profileImage);
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "회원가입에 실패했습니다");
      }

      alert("회원가입이 완료되었습니다!");
      router.push("/sign-in");
    } catch (error) {
      console.error("회원가입 실패:", error);
      alert(error instanceof Error ? error.message : "회원가입에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const openTermsModal = () => {
    setTermsContent(TERMS_OF_SERVICE);
    setShowTermsModal(true);
  };

  const openPrivacyModal = () => {
    setTermsContent(PRIVACY_POLICY);
    setShowPrivacyModal(true);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              href="/sign-in"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              로그인으로 돌아가기
            </Link>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              회원가입
            </h1>
            <p className="text-gray-600 text-sm">
              DevNogi와 함께 마비노기를 더 즐겁게!
            </p>
          </div>

          {/* Sign Up Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Profile Image */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                      {profileImagePreview ? (
                        <Image
                          src={profileImagePreview}
                          alt="Profile Preview"
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <User className="w-12 h-12" />
                      )}
                    </div>
                    <label
                      htmlFor="profile-image"
                      className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-gray-600" />
                    </label>
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">프로필 이미지 (선택사항)</p>
                </div>

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        이메일 <span className="text-red-500">*</span>
                      </FormLabel>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="example@email.com"
                            className="pl-11 pr-11 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setEmailCheckStatus("idle");
                            }}
                            onBlur={(e) => {
                              field.onBlur();
                              checkEmailAvailability(e.target.value);
                            }}
                          />
                        </FormControl>
                        {emailCheckStatus !== "idle" && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
                            {emailCheckStatus === "checking" && (
                              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                            )}
                            {emailCheckStatus === "available" && (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            )}
                            {emailCheckStatus === "unavailable" && (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                      {emailCheckStatus === "unavailable" && (
                        <p className="text-sm text-red-500 mt-1">이미 사용 중인 이메일입니다</p>
                      )}
                      {emailCheckStatus === "available" && (
                        <p className="text-sm text-green-500 mt-1">사용 가능한 이메일입니다</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        비밀번호 <span className="text-red-500">*</span>
                      </FormLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="영문, 숫자, 특수문자 포함 8-30자"
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

                      {/* Password Strength Indicator */}
                      {password && (
                        <div className="mt-2 space-y-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={clsx(
                                  "h-1 flex-1 rounded-full transition-all",
                                  level <= passwordStrength.strength
                                    ? passwordStrength.color
                                    : "bg-gray-200",
                                )}
                              />
                            ))}
                          </div>
                          <p
                            className={clsx(
                              "text-xs font-medium",
                              passwordStrength.strength <= 2 && "text-red-500",
                              passwordStrength.strength === 3 &&
                                "text-yellow-600",
                              passwordStrength.strength >= 4 &&
                                "text-green-600",
                            )}
                          >
                            비밀번호 강도: {passwordStrength.label}
                          </p>
                        </div>
                      )}

                      <FormDescription className="text-xs text-gray-500 mt-2">
                        영문 대/소문자, 숫자, 특수문자(@$!%*#?&)를 모두 포함해야
                        합니다
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Confirm */}
                <FormField
                  control={form.control}
                  name="passwordConfirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        비밀번호 확인 <span className="text-red-500">*</span>
                      </FormLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                        <FormControl>
                          <Input
                            type={showPasswordConfirm ? "text" : "password"}
                            placeholder="비밀번호를 다시 입력하세요"
                            className="pl-11 pr-11 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswordConfirm(!showPasswordConfirm)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPasswordConfirm ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {form.watch("passwordConfirm") &&
                        form.watch("password") ===
                          form.watch("passwordConfirm") && (
                          <div className="flex items-center gap-1 mt-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-600 font-medium">
                              비밀번호가 일치합니다
                            </span>
                          </div>
                        )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nickname */}
                <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        닉네임 <span className="text-red-500">*</span>
                      </FormLabel>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                        <FormControl>
                          <Input
                            placeholder="커뮤니티에서 사용할 닉네임"
                            className="pl-11 pr-11 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setNicknameCheckStatus("idle");
                            }}
                            onBlur={(e) => {
                              field.onBlur();
                              checkNicknameAvailability(e.target.value);
                            }}
                          />
                        </FormControl>
                        {nicknameCheckStatus !== "idle" && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
                            {nicknameCheckStatus === "checking" && (
                              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                            )}
                            {nicknameCheckStatus === "available" && (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            )}
                            {nicknameCheckStatus === "unavailable" && (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                      {nicknameCheckStatus === "unavailable" && (
                        <p className="text-sm text-red-500 mt-1">이미 사용 중인 닉네임입니다</p>
                      )}
                      {nicknameCheckStatus === "available" && (
                        <p className="text-sm text-green-500 mt-1">사용 가능한 닉네임입니다</p>
                      )}
                      <FormDescription className="text-xs text-gray-500 mt-2">
                        한글, 영문, 숫자만 사용 가능 (2-20자)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Divider */}
                <div className="border-t border-gray-200 my-6" />

                {/* Terms Agreement */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700">
                    약관 동의
                  </h3>

                  {/* Terms of Service */}
                  <FormField
                    control={form.control}
                    name="agreeTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5 cursor-pointer"
                          />
                        </FormControl>
                        <div className="flex-1">
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            <span className="text-red-500">[필수]</span>{" "}
                            이용약관에 동의합니다
                            <button
                              type="button"
                              onClick={openTermsModal}
                              className="ml-2 text-blue-600 hover:underline text-xs"
                            >
                              전문보기
                            </button>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Privacy Policy */}
                  <FormField
                    control={form.control}
                    name="agreePrivacy"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5 cursor-pointer"
                          />
                        </FormControl>
                        <div className="flex-1">
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            <span className="text-red-500">[필수]</span>{" "}
                            개인정보처리방침에 동의합니다
                            <button
                              type="button"
                              onClick={openPrivacyModal}
                              className="ml-2 text-blue-600 hover:underline text-xs"
                            >
                              전문보기
                            </button>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Marketing (Optional) */}
                  <FormField
                    control={form.control}
                    name="agreeMarketing"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5 cursor-pointer"
                          />
                        </FormControl>
                        <div className="flex-1">
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            <span className="text-gray-500">[선택]</span>{" "}
                            마케팅 정보 수신에 동의합니다
                          </FormLabel>
                          <FormDescription className="text-xs text-gray-500 mt-1">
                            이벤트, 혜택 정보를 이메일로 받아보실 수 있습니다
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !form.formState.isValid}
                  className={clsx(
                    "w-full h-12 mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]",
                    (!form.formState.isValid || isLoading) && "opacity-50",
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      가입 처리 중...
                    </>
                  ) : (
                    "회원가입"
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{" "}
              <Link
                href="/sign-in"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      {(showTermsModal || showPrivacyModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {showTermsModal ? "이용약관" : "개인정보처리방침"}
              </h2>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                {termsContent}
              </pre>
            </div>
            <div className="p-6 border-t border-gray-200">
              <Button
                onClick={() => {
                  setShowTermsModal(false);
                  setShowPrivacyModal(false);
                }}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
