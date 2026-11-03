"use client";

import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="grid min-h-dvh place-items-center bg-background px-4 text-center text-foreground">
      <div className="w-full max-w-md space-y-4 rounded-lg border border-border bg-card p-6 sm:p-8">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-base text-muted-foreground">
          페이지를 찾을 수 없습니다.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center px-4 py-2 gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>뒤로 가기</span>
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
