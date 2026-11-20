"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import HeroCreativeForm from "@/components/page/hero/HeroCreativeForm";
import { Button } from "@/components/ui/button";
import { heroRequest } from "@/lib/hero/request";
import type { HeroSlide } from "@/types/hero";

import HeroAdminSlideCard from "./HeroAdminSlideCard";

export default function HeroAdminSlides({
  userId,
  onChanged,
}: {
  userId: number;
  onChanged: () => Promise<unknown>;
}) {
  const [adding, setAdding] = useState(false);
  const [saved, setSaved] = useState(false);
  const slides = useQuery({
    queryKey: ["hero", "admin", "slides", userId],
    queryFn: () => heroRequest<HeroSlide[]>("admin/hero/slides"),
  });
  const order = useMutation({
    mutationFn: (ids: number[]) =>
      heroRequest("admin/hero/slides/order", "PUT", { ids }),
    onSuccess: onChanged,
  });
  const sorted = [...(slides.data ?? [])].sort(
    (a, b) => a.position - b.position || a.id - b.id,
  );
  const visibleCount = sorted.filter((slide) => slide.visible !== false).length;
  function move(index: number, direction: number) {
    const ids = sorted.map((slide) => slide.id);
    [ids[index], ids[index + direction]] = [ids[index + direction], ids[index]];
    order.mutate(ids);
  }
  return (
    <section
      id="default-images"
      aria-labelledby="default-images-heading"
      className="scroll-mt-32 space-y-4 rounded-xl border bg-card p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="default-images-heading" className="text-xl font-semibold">
          기본 이미지 ({sorted.length}/10)
        </h2>
        <Button
          className="min-h-11"
          variant="outline"
          disabled={slides.isPending || slides.isError || sorted.length >= 10}
          onClick={() => {
            setAdding(!adding);
            setSaved(false);
          }}
          aria-expanded={adding}
        >
          {adding ? "등록 닫기" : "이미지 추가"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        순서·노출 여부·기간을 관리합니다. 낙찰 광고가 있으면 1·2번에 먼저
        표시됩니다.
      </p>
      {adding ? (
        <HeroCreativeForm
          scheduling
          label="기본 이미지 등록"
          onSave={async (form) => {
            await heroRequest("admin/hero/slides", "POST", form);
            await onChanged();
            setAdding(false);
            setSaved(true);
          }}
        />
      ) : null}
      {slides.isPending ? <p role="status">기본 이미지 불러오는 중…</p> : null}
      {slides.isError ? (
        <div role="alert" className="space-y-2">
          <p>{slides.error.message}</p>
          <Button
            className="min-h-11"
            variant="outline"
            onClick={() => void slides.refetch()}
          >
            기본 이미지 다시 불러오기
          </Button>
        </div>
      ) : null}
      {!slides.isPending && !slides.isError && !sorted.length ? (
        <p>등록된 기본 이미지가 없습니다. 이미지를 추가해주세요.</p>
      ) : null}
      {sorted.map((slide, index) => (
        <HeroAdminSlideCard
          key={slide.id}
          slide={slide}
          index={index}
          total={sorted.length}
          visibleCount={visibleCount}
          ordering={order.isPending}
          onMove={move}
          onChanged={onChanged}
        />
      ))}
      {order.isPending ? <p role="status">순서 저장 중…</p> : null}
      {order.isSuccess ? <p role="status">순서를 저장했습니다.</p> : null}
      {order.isError ? (
        <p role="alert" className="text-red-700 dark:text-red-300">
          {order.error.message}
        </p>
      ) : null}
      {saved ? <p role="status">기본 이미지를 등록했습니다.</p> : null}
      <p className="text-sm text-muted-foreground">
        숨긴 이미지도 등록 수와 순서에 포함됩니다. 예약·낙찰 광고를 포함해 최대
        10개가 메인에 표시됩니다.
      </p>
    </section>
  );
}
