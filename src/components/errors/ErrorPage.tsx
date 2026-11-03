"use client";

import { Home, RotateCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-dvh place-items-center bg-background px-4 text-center text-foreground">
      <div className="w-full max-w-md space-y-4 rounded-lg border border-border bg-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold">문제가 발생했습니다!</h2>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-4 py-2 gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <RotateCw className="w-4 h-4" />
            <span>다시 시도</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 gap-2 rounded-full border border-border text-sm font-semibold hover:bg-muted"
          >
            <Home className="w-4 h-4" />
            <span>홈으로 가기</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
