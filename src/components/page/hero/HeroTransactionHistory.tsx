"use client";

import { useQuery } from "@tanstack/react-query";

import { heroRequest } from "@/lib/hero/request";
import { heroTime } from "@/lib/hero/validation";
import type { HeroHistory } from "@/types/hero";

export default function HeroTransactionHistory({ userId }: { userId: number }) {
  const history = useQuery({
    queryKey: ["hero", "history", userId],
    queryFn: () => heroRequest<HeroHistory>("user/hero/auctions"),
    retry: false,
    refetchOnMount: "always",
  });
  return (
    <section className="mt-5 border-t border-border pt-4">
      <h3 className="text-sm font-semibold">광고 XP 거래 이력</h3>
      {history.isPending ? (
        <p role="status" className="mt-2 text-sm">
          거래 이력을 불러오는 중…
        </p>
      ) : null}
      {history.isError ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {history.error.message}
        </p>
      ) : null}
      {history.data?.charges.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          광고 결제·환불 내역이 없습니다.
        </p>
      ) : null}
      <ul className="divide-y divide-border">
        {history.data?.charges.map((charge) => (
          <li
            key={charge.id}
            className="flex justify-between gap-3 py-3 text-sm"
          >
            <span>
              {charge.kind === "REFUND" ? "광고 환불" : "광고 낙찰"} · 경매 #
              {charge.auctionId}
              <time
                className="block text-xs text-muted-foreground"
                dateTime={charge.createdAt}
              >
                {heroTime(charge.createdAt)}
              </time>
            </span>
            <span className="tabular-nums">
              {charge.amount > 0 ? "−" : "+"}
              {Math.abs(charge.amount).toLocaleString()} XP
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">최근 100건 · 한국 시간</p>
    </section>
  );
}
