"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useVerificationToken,
  useIssueVerificationToken,
  useReissueVerificationToken,
} from "@/hooks/useUserVerification";
import { Button } from "@/components/ui/button";
import {
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Clock,
  PartyPopper,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import clsx from "clsx";

export default function VerificationTokenCard() {
  const { refreshUser } = useAuth();
  const {
    data: token,
    isLoading: isTokenLoading,
    refetch: refetchToken,
  } = useVerificationToken();
  const issueToken = useIssueVerificationToken();
  const reissueToken = useReissueVerificationToken();

  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);

  // Sync countdown with token's expiresInSeconds
  useEffect(() => {
    if (token && token.tokenStatus === "ACTIVE" && token.expiresInSeconds > 0) {
      setCountdown(token.expiresInSeconds);
    }
  }, [token]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          refetchToken();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, refetchToken]);

  // Detect verification success via polling
  useEffect(() => {
    if (token?.tokenStatus === "VERIFIED") {
      toast.success("캐릭터 인증이 완료되었습니다!");
      refreshUser();
    }
  }, [token?.tokenStatus, refreshUser]);

  const handleCopy = useCallback(async () => {
    if (!token?.verificationCode) return;
    try {
      await navigator.clipboard.writeText(token.verificationCode);
      setCopied(true);
      toast.success("인증 코드가 클립보드에 복사되었습니다.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("복사에 실패했습니다. 직접 복사해주세요.");
    }
  }, [token?.verificationCode]);

  const handleIssue = useCallback(async () => {
    try {
      await issueToken.mutateAsync();
      toast.success("인증 코드가 발급되었습니다.");
    } catch {
      toast.error("인증 코드 발급에 실패했습니다.");
    }
  }, [issueToken]);

  const handleReissue = useCallback(async () => {
    try {
      await reissueToken.mutateAsync();
      toast.success("인증 코드가 재발급되었습니다.");
    } catch {
      toast.error("인증 코드 재발급에 실패했습니다.");
    }
  }, [reissueToken]);

  const formatCountdown = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  if (isTokenLoading) {
    return (
      <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-200 dark:border-navy-600 p-5 sm:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-navy-600 rounded w-1/3" />
          <div className="h-16 bg-gray-200 dark:bg-navy-600 rounded" />
        </div>
      </div>
    );
  }

  const status = token?.tokenStatus;

  return (
    <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-200 dark:border-navy-600 p-5 sm:p-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
          <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          인증 코드
        </h3>
      </div>

      {/* No token or no active token */}
      {(!token || !status) && (
        <div className="text-center py-6">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            인증 코드를 발급하여 캐릭터 인증을 시작하세요.
          </p>
          <Button
            onClick={handleIssue}
            disabled={issueToken.isPending}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl h-11 px-6"
          >
            {issueToken.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <KeyRound className="w-4 h-4 mr-2" />
            )}
            인증 시작
          </Button>
        </div>
      )}

      {/* Active token */}
      {status === "ACTIVE" && token && (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-navy-700 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                인증 코드
              </span>
              <div className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono font-medium">
                  {formatCountdown(countdown)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <code className="flex-1 text-xl sm:text-2xl font-mono font-bold text-gray-900 dark:text-gray-100 tracking-wider select-all">
                {token.verificationCode}
              </code>
              <Button
                onClick={handleCopy}
                variant="outline"
                size="icon"
                className={clsx(
                  "rounded-xl flex-shrink-0 transition-colors",
                  copied && "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                )}
                title="복사"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              게임 내 캐릭터 메모에 위 코드를 입력해주세요.
            </p>
            <Button
              onClick={handleReissue}
              variant="ghost"
              size="sm"
              disabled={reissueToken.isPending}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {reissueToken.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              )}
              재발급
            </Button>
          </div>
        </div>
      )}

      {/* Verified */}
      {status === "VERIFIED" && (
        <div className="text-center py-6">
          <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <PartyPopper className="w-7 h-7 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            인증이 완료되었습니다!
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            캐릭터 인증이 성공적으로 처리되었습니다.
          </p>
        </div>
      )}

      {/* Expired or Revoked */}
      {(status === "EXPIRED" || status === "REVOKED") && (
        <div className="text-center py-6">
          <p className="text-gray-500 dark:text-gray-400 mb-1">
            {status === "EXPIRED"
              ? "인증 코드가 만료되었습니다."
              : "인증 코드가 폐기되었습니다."}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
            새로운 인증 코드를 발급받아 다시 시도해주세요.
          </p>
          <Button
            onClick={handleReissue}
            disabled={reissueToken.isPending}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl h-11 px-6"
          >
            {reissueToken.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            재발급
          </Button>
        </div>
      )}
    </div>
  );
}
