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
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <h1 className="text-2xl font-bold">에러 테스트 페이지</h1>
      <div className="flex space-x-4">
        <button
          onClick={() => {
            startTransition(() => {
              notFound();
            });
          }}
          className="px-4 py-2 font-bold text-white bg-yellow-500 rounded"
          disabled={isPending}
        >
          {isPending ? "로딩 중…" : "404 Not Found 페이지 보기"}
        </button>
        <button
          onClick={() => setError(true)}
          className="px-4 py-2 font-bold text-white bg-red-500 rounded"
        >
          일반 에러 페이지 보기
        </button>
      </div>
    </div>
  );
}
