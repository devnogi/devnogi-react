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
}

/**
 * 데이터 fetch 실패 시 표시되는 공통 에러 컴포넌트
 */
export default function DataFetchError({
  message = "데이터를 받아오지 못 하였습니다",
  onRetry,
  showRetry = true,
  className = "",
}: DataFetchErrorProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 shadow-xl p-8 ${className}`}
    >
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <p className="text-gray-700 text-lg font-medium">{message}</p>
          <p className="text-gray-400 text-sm mt-1">
            잠시 후 다시 시도해주세요
          </p>
        </div>
        {showRetry && onRetry && (
          <Button
            variant="outline"
            onClick={onRetry}
            className="mt-2 gap-2 rounded-xl border-gray-300 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            다시 시도
          </Button>
        )}
      </div>
    </div>
  );
}
