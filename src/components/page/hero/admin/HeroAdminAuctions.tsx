"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { heroRequest } from "@/lib/hero/request";
import { heroStartTime, heroTime } from "@/lib/hero/validation";
import type { HeroAuctionsResponse } from "@/types/hero";

import HeroModeration from "./HeroModeration";

export default function HeroAdminAuctions({
  userId,
  onChanged,
}: {
  userId: number;
  onChanged: () => Promise<unknown>;
}) {
  const auctions = useQuery({
    queryKey: ["hero", "admin", "auctions", userId],
    queryFn: () => heroRequest<HeroAuctionsResponse>("admin/hero/auctions"),
    refetchInterval: 30_000,
  });
  const weeks = Array.from(
    new Set(auctions.data?.auctions.map((auction) => auction.weekStart)),
  );
  return (
    <section
      id="auction-operations"
      aria-labelledby="auction-operations-heading"
      className="scroll-mt-32 space-y-4 rounded-xl border bg-card p-4 sm:p-5"
    >
      <h2 id="auction-operations-heading" className="text-xl font-semibold">
        경매 현황·운영 취소
      </h2>
      <Link
        href="/hero-auctions"
        className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
      >
        사용자 경매 화면 보기
      </Link>
      {auctions.isPending ? <p role="status">경매 불러오는 중…</p> : null}
      {auctions.isError ? (
        <div role="alert" className="space-y-2">
          <p>{auctions.error.message}</p>
          <Button
            variant="outline"
            className="min-h-11"
            onClick={() => void auctions.refetch()}
          >
            경매 다시 불러오기
          </Button>
        </div>
      ) : null}
      {auctions.data && !auctions.data.enabled ? (
        <p role="status" className="text-sm">
          {auctions.data.scheduledStartAt
            ? `${heroStartTime(auctions.data.scheduledStartAt)} (한국 시간) 시작 예정입니다. 시작 시각부터 입찰할 수 있습니다.`
            : "현재 경매가 비활성화되어 있습니다. 운영 설정을 확인해주세요."}
        </p>
      ) : null}
      {auctions.data && !weeks.length ? <p>등록된 경매가 없습니다.</p> : null}
      {weeks.map((week) => {
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
            <p className="text-sm text-muted-foreground">
              마감 {heroTime(pair[0]?.closesAt ?? null)} · 노출 시작{" "}
              {heroTime(pair[0]?.displayStartsAt ?? null)}
            </p>
            {pair.some((auction) => auction.status !== "CANCELLED") ? (
              <HeroModeration
                id={pair[0].id}
                action="cancel"
                onChanged={onChanged}
              />
            ) : null}
          </article>
        );
      })}
    </section>
  );
}
