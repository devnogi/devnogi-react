"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div role="alert" className="py-16 text-center">
      <h1 className="text-lg font-semibold">의장을 불러오지 못했어요.</h1>
      <button
        className="mt-4 min-h-11 rounded-lg border border-border px-5"
        onClick={reset}
      >
        다시 시도
      </button>
    </div>
  );
}
