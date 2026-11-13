"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DataFetchErrorProps {
  /** 에러 메시지 (기본값: "데이터를 받아오지 못 하였습니다") */
  message?: string;
  /** 재시도 콜백 함수 */
  onRetry?: () => void;
  /** 재시도 버튼 표시 여부 */
  showRetry?: boolean;
  /** 컨테이너 className */
  className?: string;
  isRetrying?: boolean;
  compact?: boolean;
}

/**
 * 데이터 fetch 실패 시 표시되는 공통 에러 컴포넌트
 */
export default function DataFetchError({
  message = "데이터를 받아오지 못 하였습니다",
  onRetry,
  showRetry = true,
  className = "",
  isRetrying = false,
  compact = false,
}: DataFetchErrorProps) {
  return (
    <div
      role="status"
      className={`rounded-2xl border border-border bg-card text-card-foreground ${compact ? "p-4" : "p-8 shadow-xl"} ${className}`}
    >
      <div
        className={`flex items-center gap-4 ${compact ? "flex-wrap justify-between" : "flex-col justify-center text-center"}`}
      >
        {!compact && (
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-500" aria-hidden="true" />
          </div>
        )}
        <div>
          <p className={`font-medium ${compact ? "text-sm" : "text-lg"}`}>
            {message}
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            잠시 후 다시 시도해주세요
          </p>
        </div>
        {showRetry && onRetry && (
          <Button
            variant="outline"
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="min-h-11 gap-2 rounded-xl"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            {isRetrying ? "다시 조회 중..." : "다시 시도"}
          </Button>
        )}
      </div>
    </div>
  );
}
