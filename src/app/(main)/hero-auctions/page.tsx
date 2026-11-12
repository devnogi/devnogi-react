"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";

import HeroCreativeForm from "@/components/page/hero/HeroCreativeForm";
import HeroTransactionHistory from "@/components/page/hero/HeroTransactionHistory";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useExperience } from "@/hooks/useExperience";
import { heroRequest } from "@/lib/hero/request";
import { heroStartTime, heroTime } from "@/lib/hero/validation";
import type {
  HeroAuction,
  HeroAuctionsResponse,
  HeroCreative,
  HeroHistory,
} from "@/types/hero";

const bidLabels: Record<string, string> = {
  LEADING: "최고 입찰 · XP 예약 중",
  OUTBID: "상위 입찰 발생 · 예약 해제",
  WON: "낙찰",
  INVALID: "무효 · 예약 해제",
  CANCELLED: "취소",
  BLOCKED: "소재 차단",
};

function AuctionBid({
  auction,
  creativeId,
  canBid,
  userId,
  availableXp,
  onChanged,
  now,
}: {
  auction: HeroAuction;
  creativeId: number | null;
  canBid: boolean;
  userId: number;
  availableXp: number;
  onChanged: () => Promise<unknown>;
  now: number;
}) {
  const minimum = Math.max(10, auction.highestBid + 1);
  const [amount, setAmount] = useState("");
  const retry = useRef<{ signature: string; key: string } | null>(null);
  const open =
    auction.status === "OPEN" &&
    Date.parse(auction.opensAt) <= now &&
    now < Date.parse(auction.closesAt);
  const budget =
    availableXp + (auction.highestBidderId === userId ? auction.highestBid : 0);
  const bid = useMutation({
    mutationFn: async () => {
      const value = Number(amount);
      if (
        !creativeId ||
        !Number.isSafeInteger(value) ||
        value < minimum ||
        value > budget
      )
        throw new Error("소재와 입찰 가능 XP를 확인해주세요.");
      const signature = `${auction.id}:${creativeId}:${value}`;
      if (retry.current?.signature !== signature)
        retry.current = { signature, key: crypto.randomUUID() };
      return heroRequest(`user/hero/auctions/${auction.id}/bids`, "POST", {
        creativeId,
        amount: value,
        idempotencyKey: retry.current.key,
      });
    },
    onSuccess: async () => {
      retry.current = null;
      setAmount("");
      await onChanged();
    },
    onError: () => {
      void onChanged();
    },
  });
  function submit(event: FormEvent) {
    event.preventDefault();
    bid.mutate();
  }
  return (
    <article className="space-y-4 rounded-xl border bg-card p-5">
      <h3 className="text-xl font-semibold">{auction.slot}번 광고</h3>
      <p className="text-3xl font-semibold tabular-nums">
        {auction.highestBid.toLocaleString()}{" "}
        <span className="text-sm font-normal">XP</span>
      </p>
      <p className="text-sm text-muted-foreground">
        {auction.highestBid === 0
          ? "첫 입찰을 기다리고 있습니다."
          : auction.highestBidderId === userId
            ? "내 입찰이 현재 최고가입니다."
            : "현재 최고 입찰가"}
      </p>
      <p className="text-sm">마감 {heroTime(auction.closesAt)}</p>
      {auction.status === "SETTLED" ? (
        <p role="status" className="text-sm font-medium">
          {auction.winningBidId ? "낙찰 확정" : "유찰 · 기본 이미지로 대체"}
        </p>
      ) : auction.status === "CANCELLED" ? (
        <p className="text-sm">취소된 경매</p>
      ) : !open ? (
        <p className="text-sm">입찰 종료 · 결과 확정 대기</p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        노출 {heroTime(auction.displayStartsAt)} ~{" "}
        {heroTime(auction.displayEndsAt)}
      </p>
      <form onSubmit={submit} className="space-y-2">
        <label className="block text-sm">
          {auction.slot}번 입찰액 (XP)
          <input
            type="number"
            required
            step="1"
            min={minimum}
            max={budget}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder={`최소 ${minimum} XP`}
            className="mt-1 block w-full rounded-md border bg-background p-2"
          />
        </label>
        <p className="text-xs text-muted-foreground">
          입찰 가능 {budget.toLocaleString()} XP · 최종 입찰액만 낙찰 시
          차감됩니다.
        </p>
        <Button
          type="submit"
          disabled={
            !open ||
            !canBid ||
            !creativeId ||
            bid.isPending ||
            !amount ||
            Number(amount) < minimum ||
            Number(amount) > budget
          }
        >
          {bid.isPending
            ? "입찰 중…"
            : open
              ? `${auction.slot}번 입찰하기`
              : "입찰 마감"}
        </Button>
      </form>
      {bid.isError ? (
        <p role="alert" className="text-sm text-destructive">
          {bid.error.message}
        </p>
      ) : null}
      {bid.isSuccess ? (
        <p role="status" className="text-sm">
          입찰했습니다. 최고가와 예약 XP를 갱신했습니다.
        </p>
      ) : null}
      {auction.reason ? <p className="text-sm">{auction.reason}</p> : null}
    </article>
  );
}

function Participation({
  userId,
  auctions,
  enabled,
  now,
}: {
  userId: number;
  auctions: HeroAuction[];
  enabled: boolean;
  now: number;
}) {
  const cache = useQueryClient();
  const { refreshUser } = useAuth();
  const xp = useExperience(userId, { refetchInterval: 30_000 });
  const [selected, setSelected] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const creatives = useQuery({
    queryKey: ["hero", "creatives", userId],
    queryFn: () => heroRequest<HeroCreative[]>("user/hero/creatives"),
    retry: false,
  });
  const history = useQuery({
    queryKey: ["hero", "history", userId],
    queryFn: () => heroRequest<HeroHistory>("user/hero/auctions"),
    refetchInterval: 30_000,
    refetchOnWindowFocus: "always",
  });
  const data = xp.data;
  const currentXp = data?.currentXp ?? data?.totalXp ?? 0;
  const availableXp = data?.availableXp ?? currentXp;
  const reservedXp = data?.reservedXp ?? 0;
  const eligible = enabled && !!data?.eligible && currentXp >= 45;
  const chosen = creatives.data?.find(
    (creative) => creative.id === selected && !creative.blocked,
  );
  async function changed() {
    await Promise.all([
      cache.invalidateQueries({ queryKey: ["hero"] }),
      cache.invalidateQueries({ queryKey: ["experience", userId] }),
      refreshUser(),
    ]);
  }
  const remove = useMutation({
    mutationFn: (id: number) =>
      heroRequest(`user/hero/creatives/${id}`, "DELETE"),
    onSuccess: changed,
  });
  return (
    <>
      <section className="space-y-3 rounded-xl border bg-card p-5">
        <h2 className="text-lg font-semibold">내 입찰 준비</h2>
        {xp.isPending ? <p role="status">XP를 확인하는 중…</p> : null}
        {xp.isError ? <p role="alert">XP를 불러오지 못했습니다.</p> : null}
        {data ? (
          <>
            <p className="flex flex-wrap gap-4 text-sm">
              <span>
                현재 <strong>{currentXp.toLocaleString()} XP</strong>
              </span>
              <span>
                예약 <strong>{reservedXp.toLocaleString()} XP</strong>
              </span>
              <span>
                사용 가능 <strong>{availableXp.toLocaleString()} XP</strong>
              </span>
            </p>
            {!data.eligible || currentXp < 45 ? (
              <p className="text-sm text-destructive">
                캐릭터 인증을 완료한 수석(45 XP) 이상 회원만 입찰할 수 있습니다.
              </p>
            ) : null}
            {reservedXp > currentXp ? (
              <p role="alert" className="text-sm text-destructive">
                활동 XP가 회수되어 예약액이 현재 XP를 초과했습니다. 마감 시
                잔액이 부족하면 두 자리의 입찰이 모두 무효가 됩니다.
              </p>
            ) : null}
            {(data.deficitXp ?? 0) > 0 ? (
              <p className="text-sm text-destructive">
                XP 부족분 {data.deficitXp?.toLocaleString()} XP는 이후
                적립분에서 먼저 상쇄됩니다.
              </p>
            ) : null}
          </>
        ) : null}
        <Button
          variant="outline"
          onClick={() => setShowUpload((value) => !value)}
        >
          {showUpload ? "등록 닫기" : "새 광고 소재 등록"}
        </Button>
        {showUpload ? (
          <HeroCreativeForm
            onSave={async (form) => {
              const created = await heroRequest<HeroCreative>(
                "user/hero/creatives",
                "POST",
                form,
              );
              setSelected(created.id);
              await changed();
            }}
          />
        ) : null}
        <h3 className="pt-2 text-sm font-semibold">입찰에 사용할 소재 선택</h3>
        {creatives.isPending ? <p role="status">소재 불러오는 중…</p> : null}
        {creatives.isError ? (
          <p role="alert">{creatives.error.message}</p>
        ) : null}
        {creatives.data?.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            이미지를 먼저 등록해주세요. 링크는 선택 사항입니다.
          </p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          {creatives.data?.map((creative) => (
            <article
              key={creative.id}
              className={`space-y-2 rounded-lg border p-3 ${selected === creative.id ? "border-primary" : ""}`}
            >
              <div className="relative aspect-[3/1] overflow-hidden rounded">
                <Image
                  src={creative.imageUrl}
                  alt={creative.altText}
                  fill
                  unoptimized
                  sizes="500px"
                  className="object-cover"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="creative"
                  value={creative.id}
                  checked={selected === creative.id}
                  disabled={creative.blocked}
                  onChange={() => setSelected(creative.id)}
                />
                {creative.altText}
                {creative.blocked ? " (차단됨)" : ""}
              </label>
              <p className="break-all text-xs text-muted-foreground">
                {creative.linkUrl || "링크 없음"}
              </p>
              <Button
                size="sm"
                variant="outline"
                disabled={remove.isPending}
                onClick={() => remove.mutate(creative.id)}
              >
                미사용 소재 삭제
              </Button>
            </article>
          ))}
        </div>
        {remove.isError ? (
          <p role="alert" className="text-sm text-destructive">
            {remove.error.message}
          </p>
        ) : null}
      </section>
      <section
        aria-label="주간 광고 경매"
        className="grid gap-4 md:grid-cols-2"
      >
        {auctions.map((auction) => (
          <AuctionBid
            key={auction.id}
            auction={auction}
            creativeId={chosen?.id ?? null}
            canBid={eligible}
            userId={userId}
            availableXp={availableXp}
            onChanged={changed}
            now={now}
          />
        ))}
      </section>
      <section className="rounded-xl border bg-card p-5">
        <h2 className="text-lg font-semibold">내 참여 이력</h2>
        {history.isPending ? <p role="status">참여 이력 불러오는 중…</p> : null}
        {history.isError ? <p role="alert">{history.error.message}</p> : null}
        {history.data?.bids.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            아직 입찰 내역이 없습니다.
          </p>
        ) : null}
        <ul className="divide-y">
          {history.data?.bids.map((bid) => (
            <li key={bid.id} className="space-y-1 py-3 text-sm">
              <p>
                경매 #{bid.auctionId} · {bid.amount.toLocaleString()} XP ·{" "}
                {bidLabels[bid.status] ?? bid.status}
              </p>
              <time
                className="text-xs text-muted-foreground"
                dateTime={bid.createdAt}
              >
                {heroTime(bid.createdAt)}
              </time>
              {bid.reason ? <p>{bid.reason}</p> : null}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">최근 100건</p>
        <HeroTransactionHistory userId={userId} />
      </section>
    </>
  );
}

export default function HeroAuctionsPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  if (isLoading) return <p role="status">로그인 확인 중…</p>;
  if (!isAuthenticated || !user)
    return (
      <main className="mx-auto max-w-3xl space-y-4 py-8">
        <h1 className="text-xl font-semibold">로그인이 필요합니다</h1>
        <p>광고 경매는 로그인 후 이용할 수 있습니다.</p>
        <Link
          href="/sign-in"
          prefetch={false}
          className="text-primary underline"
        >
          로그인하기
        </Link>
      </main>
    );
  return <MemberHeroAuctions userId={user.userId} />;
}

function MemberHeroAuctions({ userId }: { userId: number }) {
  const query = useQuery({
    queryKey: ["hero", "auctions"],
    queryFn: () => heroRequest<HeroAuctionsResponse>("hero/auctions/current"),
    refetchInterval: 30_000,
    refetchOnWindowFocus: "always",
    retry: false,
  });
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const serverNow = query.data
    ? Date.parse(query.data.serverTime) + Math.max(0, now - query.dataUpdatedAt)
    : now;
  const all = query.data?.auctions ?? [];
  const latest = all
    .map((item) => item.weekStart)
    .sort()
    .at(-1);
  const current = all
    .filter((item) => item.weekStart === latest)
    .sort((a, b) => a.slot - b.slot);
  return (
    <main className="mx-auto max-w-5xl space-y-6 py-5">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">메인 Hero · 주간 광고</p>
        <h1 className="text-3xl font-bold">XP로 나의 광고를 알리세요</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          매주 월요일 00시부터 일요일 22시까지, 1·2번 자리를 각각 경매합니다.
          낙찰 광고는 다음 월요일부터 7일간 노출됩니다. 모든 시각은 한국
          시간입니다.
        </p>
      </header>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">경매 규칙 보기</Button>
        </DialogTrigger>
        <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden sm:max-w-2xl">
          <DialogHeader className="shrink-0 pr-8">
            <DialogTitle>광고 경매 규칙</DialogTitle>
            <DialogDescription>
              입찰 전 참여 조건과 XP 처리 규칙을 확인해주세요.
            </DialogDescription>
          </DialogHeader>
          <div
            role="region"
            aria-label="광고 경매 규칙 내용"
            tabIndex={0}
            className="min-h-0 overflow-y-auto pr-2 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <p className="text-sm leading-6">
              경매는 매주 월요일 00시부터 일요일 22시까지 열립니다. 낙찰 광고는
              다음 월요일 00시부터 7일간 노출됩니다. 모든 시각은 한국
              시간입니다.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
              <li>
                인증된 정상 회원이면서 수석(45 XP) 이상이어야 합니다. 최소 10
                XP, 1 XP 단위로 현재 최고가보다 높게 입찰합니다.
              </li>
              <li>
                최고 입찰액은 예약되며 다른 사람이 높은 금액을 부르면 즉시
                해제됩니다. 낙찰자만 최종 입찰액을 지불하고 등급이 내려갈 수
                있습니다.
              </li>
              <li>
                두 자리 모두 낙찰받을 수 있습니다. 마감 직전 등급과 합산 잔액을
                검사하며, 합산 잔액이 부족하면 두 입찰 모두 무효입니다.
                차순위에게 승계하지 않습니다.
              </li>
              <li>
                입찰 취소·금액 인하·자동 입찰·마감 연장은 없습니다. 소재 교체는
                더 높은 금액으로 재입찰해야 하며 낙찰 이후에는 바꿀 수 없습니다.
              </li>
              <li>
                정책 위반 소재는 사전 심사 없이도 관리자가 차단할 수 있으며 노출
                중단 시 환불하지 않습니다. 운영 사유로 경매를 취소하면 전액
                환불합니다.
              </li>
              <li>
                활동 삭제로 XP가 회수될 수 있습니다. 이미 소비한 XP의 부족분은
                이후 적립에서 먼저 상쇄됩니다.
              </li>
            </ul>
          </div>
          <DialogFooter className="shrink-0">
            <DialogClose asChild>
              <Button variant="outline" className="min-h-11">
                닫기
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {query.isPending ? <p role="status">경매 불러오는 중…</p> : null}
      {query.isError ? (
        <p role="alert">
          {query.error.message}{" "}
          <Button variant="outline" onClick={() => void query.refetch()}>
            다시 시도
          </Button>
        </p>
      ) : null}
      {query.data && !query.data.enabled ? (
        <p role="status" className="rounded-lg border p-4">
          {query.data.scheduledStartAt
            ? `${heroStartTime(query.data.scheduledStartAt)} (한국 시간) 시작 예정입니다. 시작 시각부터 입찰할 수 있습니다.`
            : "현재 광고 경매가 비활성화되어 있습니다."}
        </p>
      ) : null}
      <Participation
        userId={userId}
        auctions={current}
        enabled={query.data?.enabled ?? false}
        now={serverNow}
      />
      {all.some((item) => item.weekStart !== latest) ? (
        <section className="space-y-3 rounded-xl border p-5">
          <h2 className="text-lg font-semibold">지난 경매 결과</h2>
          {all
            .filter((item) => item.weekStart !== latest)
            .map((auction) => (
              <p key={auction.id} className="text-sm">
                {auction.slot}번 ·{" "}
                {auction.winningBidId
                  ? `${auction.highestBid.toLocaleString()} XP 낙찰`
                  : auction.status === "CANCELLED"
                    ? "취소"
                    : "유찰 또는 정산 대기"}{" "}
                · 노출 {heroTime(auction.displayStartsAt)} ~{" "}
                {heroTime(auction.displayEndsAt)}
                {auction.reason ? ` · ${auction.reason}` : ""}
              </p>
            ))}
        </section>
      ) : null}
    </main>
  );
}
