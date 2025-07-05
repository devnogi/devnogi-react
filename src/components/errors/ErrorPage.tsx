"use client";

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
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">문제가 발생했습니다!</h2>
        <button
          onClick={() => reset()}
          className="inline-block px-4 py-2 font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
