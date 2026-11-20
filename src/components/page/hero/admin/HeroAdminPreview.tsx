"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { heroRequest } from "@/lib/hero/request";
import { fromKoreanInput, toKoreanInput } from "@/lib/hero/validation";
import type { HeroResponse } from "@/types/hero";

import HeroAdminImage from "./HeroAdminImage";

export default function HeroAdminPreview({ userId }: { userId: number }) {
  const [previewAt, setPreviewAt] = useState(() =>
    toKoreanInput(new Date().toISOString()),
  );
  const [requestedAt, setRequestedAt] = useState("");
  const [error, setError] = useState("");
  const preview = useQuery({
    queryKey: ["hero", "admin", "preview", requestedAt, userId],
    queryFn: () =>
      heroRequest<HeroResponse>(
        `admin/hero/preview?at=${encodeURIComponent(requestedAt)}`,
      ),
    enabled: !!requestedAt,
  });
  return (
    <section
      id="display-preview"
      aria-labelledby="display-preview-heading"
      className="scroll-mt-32 space-y-4 rounded-xl border bg-card p-4 sm:p-5"
    >
      <h2 id="display-preview-heading" className="text-xl font-semibold">
        시간별 실제 노출 순서
      </h2>
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setError("");
          try {
            const at = fromKoreanInput(previewAt);
            if (!at) throw new Error("미리보기 시각을 입력해주세요.");
            if (at === requestedAt) void preview.refetch();
            else setRequestedAt(at);
          } catch {
            setError("올바른 미리보기 시각을 입력해주세요.");
          }
        }}
      >
        <label className="min-w-0 text-sm">
          미리보기 시각 (한국 시간)
          <input
            required
            type="datetime-local"
            value={previewAt}
            onChange={(event) => setPreviewAt(event.target.value)}
            className="mt-1 block min-h-11 max-w-full rounded-md border border-input bg-background p-2"
          />
        </label>
        <Button
          type="submit"
          className="min-h-11"
          disabled={preview.isFetching}
        >
          미리보기
        </Button>
      </form>
      {error ? (
        <p role="alert" className="text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}
      {preview.isFetching ? <p role="status">미리보기 불러오는 중…</p> : null}
      {preview.isError ? (
        <div role="alert" className="space-y-2">
          <p>{preview.error.message}</p>
          <Button
            variant="outline"
            className="min-h-11"
            onClick={() => void preview.refetch()}
          >
            미리보기 다시 불러오기
          </Button>
        </div>
      ) : null}
      {!requestedAt ? (
        <p className="text-sm text-muted-foreground">
          시각을 선택하면 예약 이미지와 낙찰 광고를 반영한 노출 순서를 확인할 수
          있습니다.
        </p>
      ) : null}
      <ol className="grid gap-3 sm:grid-cols-2">
        {preview.data?.items.map((slide) => (
          <li
            key={`${slide.id}-${slide.position}`}
            className="space-y-2 rounded-lg border p-3"
          >
            <HeroAdminImage imageUrl={slide.imageUrl} altText={slide.altText} />
            <p className="text-sm">
              {slide.position}번 ·{" "}
              {slide.advertisement ? "낙찰 광고" : "기본 이미지"} ·{" "}
              {slide.altText}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
