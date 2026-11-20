"use client";

import { useState } from "react";

import HeroCreativeForm from "@/components/page/hero/HeroCreativeForm";
import { Button } from "@/components/ui/button";
import { heroRequest } from "@/lib/hero/request";
import { heroTime } from "@/lib/hero/validation";
import type { HeroSlide } from "@/types/hero";

import HeroAdminConfirm from "./HeroAdminConfirm";
import HeroAdminImage from "./HeroAdminImage";
import HeroAdminLink from "./HeroAdminLink";

function status(slide: HeroSlide) {
  if (slide.visible === false) return "숨김";
  const now = Date.now();
  if (slide.startsAt && Date.parse(slide.startsAt) > now) return "노출 예정";
  if (slide.endsAt && Date.parse(slide.endsAt) <= now) return "노출 종료";
  return "노출 가능";
}

export default function HeroAdminSlideCard({
  slide,
  index,
  total,
  visibleCount,
  ordering,
  onMove,
  onChanged,
}: {
  slide: HeroSlide;
  index: number;
  total: number;
  visibleCount: number;
  ordering: boolean;
  onMove: (index: number, direction: number) => void;
  onChanged: () => Promise<unknown>;
}) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const visible = slide.visible !== false;
  const lastVisible = visible && visibleCount <= 1;
  async function toggleVisibility() {
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      await heroRequest(`admin/hero/slides/${slide.id}/visibility`, "PUT", {
        visible: !visible,
      });
      await onChanged();
      setFeedback(visible ? "이미지를 숨겼습니다." : "노출을 허용했습니다.");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "노출 설정을 저장하지 못했습니다.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <article
      className="space-y-4 rounded-lg border p-4"
      aria-label={`기본 이미지 ${index + 1}: ${slide.altText}`}
    >
      <div className="grid gap-4 sm:grid-cols-[240px_1fr]">
        <HeroAdminImage imageUrl={slide.imageUrl} altText={slide.altText} />
        <div className="min-w-0 space-y-2">
          <h3 className="font-semibold">
            {index + 1}. {slide.altText}
          </h3>
          <p className="text-sm font-medium">{status(slide)}</p>
          <HeroAdminLink value={slide.linkUrl} />
          <p className="text-sm text-muted-foreground">
            시작 {heroTime(slide.startsAt)} · 종료 {heroTime(slide.endsAt)}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-start gap-2">
        <Button
          className="min-h-11"
          variant="outline"
          aria-label={`${slide.altText} 위로`}
          disabled={index === 0 || ordering}
          onClick={() => onMove(index, -1)}
        >
          위로
        </Button>
        <Button
          className="min-h-11"
          variant="outline"
          aria-label={`${slide.altText} 아래로`}
          disabled={index === total - 1 || ordering}
          onClick={() => onMove(index, 1)}
        >
          아래로
        </Button>
        <Button
          className="min-h-11"
          variant="outline"
          onClick={() => setEditing(!editing)}
          aria-expanded={editing}
        >
          {editing ? "수정 닫기" : "수정"}
        </Button>
        <Button
          className="min-h-11"
          variant="outline"
          disabled={busy || lastVisible}
          onClick={() => void toggleVisibility()}
        >
          {busy ? "저장 중…" : visible ? "숨기기" : "노출하기"}
        </Button>
        <HeroAdminConfirm
          label="삭제"
          title="기본 이미지를 삭제할까요?"
          description={`‘${slide.altText}’ 이미지는 메인 화면에서 제외됩니다. 운영 이력은 보존됩니다.`}
          disabled={total <= 1 || lastVisible}
          onConfirm={async () => {
            await heroRequest(`admin/hero/slides/${slide.id}`, "DELETE");
            await onChanged();
          }}
        />
      </div>
      {lastVisible ? (
        <p className="text-sm text-muted-foreground">
          마지막 노출 가능 이미지는 숨기거나 삭제할 수 없습니다.
        </p>
      ) : null}
      {feedback ? (
        <p role="status" className="text-sm">
          {feedback}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}
      {editing ? (
        <HeroCreativeForm
          initial={slide}
          scheduling
          label="변경 저장"
          onSave={async (form) => {
            await heroRequest(`admin/hero/slides/${slide.id}`, "PUT", form);
            await onChanged();
            setEditing(false);
            setFeedback("변경 내용을 저장했습니다.");
          }}
        />
      ) : null}
    </article>
  );
}
