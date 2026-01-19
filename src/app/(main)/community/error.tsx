"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Community 페이지 Error Boundary
 * 예기치 못한 에러 발생 시 페이지가 죽지 않도록 보호
 */
export default function CommunityError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Next.js 서버 로그에 에러 기록
    console.error("[Community Error Boundary]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <main className="flex flex-col items-center justify-center min-h-[50vh] px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          페이지 로딩 중 오류가 발생했습니다
        </h2>

        <p className="text-gray-500 mb-6">
          커뮤니티 데이터를 받아오지 못 하였습니다.
          <br />
          잠시 후 다시 시도해주세요.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="gap-2 bg-forest-500 hover:bg-forest-600 rounded-xl"
          >
            <RefreshCw className="w-4 h-4" />
            다시 시도
          </Button>

          <Link href="/">
            <Button
              variant="outline"
              className="gap-2 rounded-xl border-gray-300 hover:bg-gray-50 w-full"
            >
              <Home className="w-4 h-4" />
              홈으로 이동
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
