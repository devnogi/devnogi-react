"use client";

import { notFound } from "next/navigation";
import { useState, useTransition } from "react";

export default function ErrorTestPage() {
  const [error, setError] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (error) {
    throw new Error("의도적으로 발생시킨 에러입니다!");
  }

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-lg border border-border bg-card p-6 text-foreground">
      <h1 className="text-xl font-semibold">에러 테스트 페이지</h1>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            startTransition(() => {
              notFound();
            });
          }}
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-full"
          disabled={isPending}
        >
          {isPending ? "로딩 중…" : "404 Not Found 페이지 보기"}
        </button>
        <button
          onClick={() => setError(true)}
          className="px-4 py-2 text-sm font-medium border border-border hover:bg-muted rounded-full"
        >
          일반 에러 페이지 보기
        </button>
      </div>
    </div>
  );
}
