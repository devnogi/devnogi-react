"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import HeroCreativeForm from "@/components/page/hero/HeroCreativeForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { heroRequest } from "@/lib/hero/request";
import {
  fromKoreanInput,
  heroTime,
  toKoreanInput,
} from "@/lib/hero/validation";
import type {
  HeroAuctionsResponse,
  HeroCreative,
  HeroResponse,
  HeroSlide,
} from "@/types/hero";
import { isAdminRole } from "@/utils/roles";

function Moderation({
  id,
  kind,
  onChanged,
}: {
  id: number;
  kind: "creative" | "auction";
  onChanged: () => Promise<unknown>;
}) {
  const [reason, setReason] = useState("");
  const action = useMutation({
    mutationFn: () =>
      heroRequest(
        kind === "creative"
          ? `admin/hero/creatives/${id}/block`
          : `admin/hero/auctions/${id}/cancel`,
        "POST",
        { reason: reason.trim() },
      ),
    onSuccess: onChanged,
  });
  return (
    <div className="space-y-2">
      <label className="block text-sm">
        {kind === "creative" ? "소재 차단 사유" : "해당 주차 전체 취소 사유"}
        <input
          required
          maxLength={500}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="mt-1 block w-full rounded border bg-background p-2"
        />
      </label>
      <Button
        variant="destructive"
        size="sm"
        disabled={!reason.trim() || action.isPending}
        onClick={() => action.mutate()}
      >
        {kind === "creative"
          ? "소재 차단·광고 중단 (환불 없음)"
          : "이 주차 두 경매 취소·전액 환불"}
      </Button>
      {action.isError ? (
        <p role="alert" className="text-sm text-destructive">
          {action.error.message}
        </p>
      ) : null}
      {action.isSuccess ? (
        <p role="status" className="text-sm">
          처리했습니다.
        </p>
      ) : null}
    </div>
  );
}

export default function HeroAdministration() {
  const { user, isLoading } = useAuth();
  const admin = isAdminRole(user?.role);
  const cache = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [previewAt, setPreviewAt] = useState(() =>
    toKoreanInput(new Date().toISOString()),
  );
  const [requestedAt, setRequestedAt] = useState("");
  const slides = useQuery({
    queryKey: ["hero", "admin", "slides", user?.userId],
    queryFn: () => heroRequest<HeroSlide[]>("admin/hero/slides"),
    enabled: admin,
  });
  const auctions = useQuery({
    queryKey: ["hero", "admin", "auctions", user?.userId],
    queryFn: () => heroRequest<HeroAuctionsResponse>("admin/hero/auctions"),
    enabled: admin,
    refetchInterval: 30_000,
  });
  const creatives = useQuery({
    queryKey: ["hero", "admin", "creatives", user?.userId],
    queryFn: () => heroRequest<HeroCreative[]>("admin/hero/creatives"),
    enabled: admin,
  });
  const preview = useQuery({
    queryKey: ["hero", "admin", "preview", requestedAt, user?.userId],
    queryFn: () =>
      heroRequest<HeroResponse>(
        `admin/hero/preview?at=${encodeURIComponent(requestedAt)}`,
      ),
    enabled: admin && !!requestedAt,
  });
  async function changed() {
    await Promise.all([
      cache.invalidateQueries({ queryKey: ["hero"] }),
      cache.invalidateQueries({ queryKey: ["experience"] }),
    ]);
  }
  const remove = useMutation({
    mutationFn: (id: number) =>
      heroRequest(`admin/hero/slides/${id}`, "DELETE"),
    onSuccess: changed,
  });
  const order = useMutation({
    mutationFn: (ids: number[]) =>
      heroRequest("admin/hero/slides/order", "PUT", { ids }),
    onSuccess: changed,
  });
  const sorted = [...(slides.data ?? [])].sort(
    (a, b) => a.position - b.position,
  );
  function move(index: number, direction: number) {
    const ids = sorted.map((slide) => slide.id);
    [ids[index], ids[index + direction]] = [ids[index + direction], ids[index]];
    order.mutate(ids);
  }
  if (isLoading) return <p role="status">권한 확인 중…</p>;
  if (!admin) return <p role="alert">관리자 계정으로 로그인해야 합니다.</p>;
  return (
    <main className="mx-auto max-w-5xl space-y-6 py-5">
      <header className="space-y-2">
        <Link href="/admin" className="text-sm text-primary underline">
          운영자 작업 콘솔
        </Link>
        <h1 className="text-3xl font-bold">메인 Hero·광고 경매 관리</h1>
        <p className="text-sm text-muted-foreground">
          기본 이미지 1~10개 · 낙찰 광고는 1·2번 위치에 우선 배치 · 모든 일정은
          한국 시간
        </p>
      </header>
      <section className="space-y-4 rounded-xl border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">
            기본 이미지 ({sorted.length}/10)
          </h2>
          <Button
            variant="outline"
            disabled={sorted.length >= 10}
            onClick={() => setAdding((value) => !value)}
          >
            {adding ? "등록 닫기" : "이미지 추가"}
          </Button>
        </div>
        {adding ? (
          <HeroCreativeForm
            scheduling
            label="기본 이미지 등록"
            onSave={async (form) => {
              await heroRequest("admin/hero/slides", "POST", form);
              setAdding(false);
              await changed();
            }}
          />
        ) : null}
        {slides.isPending ? (
          <p role="status">기본 이미지 불러오는 중…</p>
        ) : null}
        {slides.isError ? <p role="alert">{slides.error.message}</p> : null}
        {sorted.map((slide, index) => (
          <article key={slide.id} className="space-y-3 rounded-lg border p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative aspect-[3/1] w-full overflow-hidden rounded sm:w-60">
                <Image
                  src={slide.imageUrl}
                  alt={slide.altText}
                  fill
                  unoptimized
                  sizes="400px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="font-semibold">
                  {index + 1}. {slide.altText}
                </h3>
                <p className="break-all text-xs text-muted-foreground">
                  {slide.linkUrl || "링크 없음"}
                </p>
                <p className="text-xs">
                  시작 {heroTime(slide.startsAt)} · 종료{" "}
                  {heroTime(slide.endsAt)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                aria-label={`${slide.altText} 위로`}
                disabled={index === 0 || order.isPending}
                onClick={() => move(index, -1)}
              >
                위로
              </Button>
              <Button
                size="sm"
                variant="outline"
                aria-label={`${slide.altText} 아래로`}
                disabled={index === sorted.length - 1 || order.isPending}
                onClick={() => move(index, 1)}
              >
                아래로
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setEditing(editing === slide.id ? null : slide.id)
                }
              >
                {editing === slide.id ? "수정 닫기" : "수정"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={sorted.length <= 1 || remove.isPending}
                onClick={() => remove.mutate(slide.id)}
              >
                삭제
              </Button>
            </div>
            {editing === slide.id ? (
              <HeroCreativeForm
                initial={slide}
                scheduling
                label="변경 저장"
                onSave={async (form) => {
                  await heroRequest(
                    `admin/hero/slides/${slide.id}`,
                    "PUT",
                    form,
                  );
                  setEditing(null);
                  await changed();
                }}
              />
            ) : null}
          </article>
        ))}
        {remove.isError ? <p role="alert">{remove.error.message}</p> : null}
        {order.isError ? <p role="alert">{order.error.message}</p> : null}
        <p className="text-xs text-muted-foreground">
          삭제는 이력을 보존하며 마지막 기본 이미지는 삭제할 수 없습니다. 예약된
          광고가 있으면 뒤쪽 기본 이미지는 최대 10개 제한에 따라 잠시
          제외됩니다.
        </p>
      </section>
      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="text-xl font-semibold">시간별 실제 노출 순서</h2>
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            setRequestedAt(fromKoreanInput(previewAt));
          }}
        >
          <label className="text-sm">
            미리보기 시각 (한국 시간)
            <input
              required
              type="datetime-local"
              value={previewAt}
              onChange={(event) => setPreviewAt(event.target.value)}
              className="mt-1 block rounded border bg-background p-2"
            />
          </label>
          <Button type="submit">미리보기</Button>
        </form>
        {preview.isFetching ? <p role="status">미리보기 불러오는 중…</p> : null}
        {preview.isError ? <p role="alert">{preview.error.message}</p> : null}
        <ol className="grid gap-3 sm:grid-cols-2">
          {preview.data?.items.map((slide) => (
            <li
              key={`${slide.id}-${slide.position}`}
              className="space-y-2 rounded border p-3"
            >
              <div className="relative aspect-[3/1]">
                <Image
                  src={slide.imageUrl}
                  alt={slide.altText}
                  fill
                  unoptimized
                  sizes="500px"
                  className="rounded object-cover"
                />
              </div>
              <p className="text-sm">
                {slide.position}번 ·{" "}
                {slide.advertisement ? "낙찰 광고" : "기본 이미지"} ·{" "}
                {slide.altText}
              </p>
            </li>
          ))}
        </ol>
      </section>
      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="text-xl font-semibold">경매 현황·운영 취소</h2>
        <Link href="/hero-auctions" className="text-sm text-primary underline">
          사용자 경매 화면 보기
        </Link>
        {auctions.isPending ? <p role="status">경매 불러오는 중…</p> : null}
        {auctions.isError ? <p role="alert">{auctions.error.message}</p> : null}
        {auctions.data && !auctions.data.enabled ? (
          <p className="text-sm">
            현재 경매가 비활성화되어 있습니다. 운영 설정과 시작일을
            확인해주세요.
          </p>
        ) : null}
        {Array.from(
          new Set(auctions.data?.auctions.map((auction) => auction.weekStart)),
        ).map((week) => {
          const pair =
            auctions.data?.auctions.filter(
              (auction) => auction.weekStart === week,
            ) ?? [];
          return (
            <article key={week} className="space-y-3 rounded-lg border p-4">
              <h3 className="font-semibold">{week} 주차</h3>
              {pair.map((auction) => (
                <p key={auction.id} className="text-sm">
                  {auction.slot}번 ·{" "}
                  {auction.status === "OPEN"
                    ? "진행·정산 대기"
                    : auction.status === "SETTLED"
                      ? "확정"
                      : "취소"}{" "}
                  · {auction.highestBid.toLocaleString()} XP ·{" "}
                  {auction.winningBidId ? "낙찰" : "낙찰 없음"}
                  {auction.reason ? ` · ${auction.reason}` : ""}
                </p>
              ))}
              <p className="text-xs text-muted-foreground">
                마감 {heroTime(pair[0]?.closesAt ?? null)} · 노출 시작{" "}
                {heroTime(pair[0]?.displayStartsAt ?? null)}
              </p>
              {pair.some((auction) => auction.status !== "CANCELLED") ? (
                <Moderation
                  id={pair[0].id}
                  kind="auction"
                  onChanged={changed}
                />
              ) : null}
            </article>
          );
        })}
      </section>
      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="text-xl font-semibold">사용자 광고 소재 관리</h2>
        <p className="text-sm text-muted-foreground">
          최근 등록 100개와 입찰·예정·노출에 사용 중인 소재입니다. 차단하면 진행
          중 입찰 또는 예정·노출 광고를 중단하며, 이미 지불한 XP는 환불하지
          않습니다.
        </p>
        {creatives.isPending ? <p role="status">소재 불러오는 중…</p> : null}
        {creatives.isError ? (
          <p role="alert">{creatives.error.message}</p>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          {creatives.data?.map((creative) => (
            <article
              key={creative.id}
              className="space-y-3 rounded-lg border p-4"
            >
              <div className="relative aspect-[3/1]">
                <Image
                  src={creative.imageUrl}
                  alt={creative.altText}
                  fill
                  unoptimized
                  sizes="500px"
                  className="rounded object-cover"
                />
              </div>
              <h3 className="font-medium">
                #{creative.id} {creative.altText}
              </h3>
              <p className="break-all text-xs text-muted-foreground">
                {creative.linkUrl || "링크 없음"}
              </p>
              {creative.blocked ? (
                <p className="text-sm text-destructive">차단된 소재</p>
              ) : (
                <Moderation
                  id={creative.id}
                  kind="creative"
                  onChanged={changed}
                />
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
