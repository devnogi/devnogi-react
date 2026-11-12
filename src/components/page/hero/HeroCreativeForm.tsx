"use client";

import Image from "next/image";
import { FormEvent, useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  fromKoreanInput,
  toKoreanInput,
  validateHeroImage,
  validateHeroLink,
} from "@/lib/hero/validation";
import type { HeroSlide } from "@/types/hero";

export default function HeroCreativeForm({
  initial,
  scheduling = false,
  onSave,
  label = "소재 등록",
}: {
  initial?: HeroSlide;
  scheduling?: boolean;
  onSave: (data: FormData) => Promise<unknown>;
  label?: string;
}) {
  const id = useId();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(initial?.imageUrl ?? "");
  const [altText, setAltText] = useState(initial?.altText ?? "");
  const [linkUrl, setLinkUrl] = useState(initial?.linkUrl ?? "");
  const [startsAt, setStartsAt] = useState(
    toKoreanInput(initial?.startsAt ?? null),
  );
  const [endsAt, setEndsAt] = useState(toKoreanInput(initial?.endsAt ?? null));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!file) {
      setPreview(initial?.imageUrl ?? "");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file, initial?.imageUrl]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);
    setBusy(true);
    try {
      validateHeroLink(linkUrl);
      if (!file && !initial) throw new Error("광고 이미지를 등록해주세요.");
      if (file) await validateHeroImage(file);
      if (startsAt && endsAt && startsAt >= endsAt)
        throw new Error("종료 시각은 시작 시각보다 뒤여야 합니다.");
      const form = new FormData();
      if (file) form.set("image", file);
      form.set("altText", altText.trim());
      form.set("linkUrl", linkUrl);
      if (scheduling) {
        form.set("startsAt", fromKoreanInput(startsAt));
        form.set("endsAt", fromKoreanInput(endsAt));
      }
      await onSave(form);
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "등록하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }
  const input =
    "mt-1 block w-full rounded-md border border-input bg-background p-2 text-sm";
  return (
    <form onSubmit={submit} className="space-y-4">
      <label htmlFor={`${id}-image`} className="block text-sm font-medium">
        이미지 {initial ? "교체 (선택)" : "(필수)"}
        <input
          id={`${id}-image`}
          type="file"
          accept="image/jpeg,image/png"
          required={!initial}
          disabled={busy}
          className={input}
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setSaved(false);
          }}
        />
      </label>
      <p className="text-xs text-muted-foreground">
        JPEG·PNG, 최대 10 MiB·2,400만 화소. 권장 1920×640. 화면 크기에 따라
        가장자리가 잘리고 검색창이 겹칩니다.
      </p>
      <label htmlFor={`${id}-alt`} className="block text-sm font-medium">
        이미지 설명 (필수)
        <input
          id={`${id}-alt`}
          required
          maxLength={200}
          value={altText}
          onChange={(event) => setAltText(event.target.value)}
          className={input}
        />
      </label>
      <label htmlFor={`${id}-link`} className="block text-sm font-medium">
        이동 링크 (선택)
        <input
          id={`${id}-link`}
          type="url"
          maxLength={2048}
          placeholder="https://www.memonogi.com/guilds"
          value={linkUrl}
          onChange={(event) => setLinkUrl(event.target.value)}
          className={input}
        />
      </label>
      <p className="text-xs text-muted-foreground">
        https://*.memonogi.com만 허용합니다. memonogi.com 자체 및 외부 사이트는
        사용할 수 없습니다.
      </p>
      {scheduling ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            노출 시작 (한국 시간)
            <input
              type="datetime-local"
              className={input}
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
            />
          </label>
          <label className="text-sm">
            노출 종료 (한국 시간)
            <input
              type="datetime-local"
              className={input}
              value={endsAt}
              onChange={(event) => setEndsAt(event.target.value)}
            />
          </label>
          <p className="text-xs text-muted-foreground sm:col-span-2">
            비워두면 제한이 없습니다. 종료 시각부터 노출되지 않습니다.
          </p>
        </div>
      ) : null}
      {preview ? (
        <div className="space-y-3">
          <p className="text-sm font-medium">실제 배치 미리보기</p>
          {[
            { label: "데스크톱", className: "aspect-[5/1]" },
            { label: "모바일", className: "mx-auto h-56 max-w-[360px]" },
          ].map((view) => (
            <figure key={view.label}>
              <figcaption className="mb-1 text-xs text-muted-foreground">
                {view.label}
              </figcaption>
              <div
                className={`relative overflow-hidden rounded-md border ${view.className}`}
              >
                <Image
                  src={preview}
                  alt={altText || "업로드 이미지 미리보기"}
                  fill
                  unoptimized
                  className="object-cover brightness-75"
                  sizes="800px"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-4 top-1/3 rounded-md border bg-background/95 p-3 text-xs text-muted-foreground"
                >
                  아이템 검색창 영역
                </div>
              </div>
            </figure>
          ))}
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="text-sm">
          저장했습니다.
        </p>
      ) : null}
      <Button type="submit" disabled={busy || !altText.trim()}>
        {busy ? "저장 중…" : label}
      </Button>
    </form>
  );
}
