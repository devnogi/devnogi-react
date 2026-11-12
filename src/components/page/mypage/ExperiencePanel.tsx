"use client";

import Link from "next/link";

import HeroTransactionHistory from "@/components/page/hero/HeroTransactionHistory";
import ActivityGradeBadge from "@/components/ui/ActivityGradeBadge";
import { Button } from "@/components/ui/button";
import { useExperience, useExperienceHistory } from "@/hooks/useExperience";
import { ACTIVITY_GRADE_LABELS } from "@/types/experience";

export default function ExperiencePanel({ userId }: { userId: number }) {
  const summary = useExperience(userId);
  const history = useExperienceHistory(userId);
  const data = summary.data;
  const items = history.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <section
      aria-labelledby="experience-heading"
      className="rounded-lg border border-border bg-card p-4 text-card-foreground sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="experience-heading" className="text-base font-semibold">
          활동 경험치
        </h2>
        <Button
          variant="outline"
          size="sm"
          disabled={summary.isFetching || history.isFetching}
          onClick={() => {
            void summary.refetch();
            void history.refetch();
          }}
        >
          새로고침
        </Button>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        활동 경험치는 잠시 후 반영됩니다. 활동을 삭제하거나 좋아요를 취소하면
        경험치와 등급이 내려갈 수 있습니다.
      </p>
      {summary.isPending ? (
        <p role="status" className="mt-4 text-sm">
          경험치를 불러오는 중입니다.
        </p>
      ) : null}
      {summary.isError ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          경험치를 불러오지 못했습니다. 새로고침으로 다시 시도해주세요.
        </p>
      ) : null}
      {data ? (
        <>
          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <ActivityGradeBadge
              grade={data.activityGrade}
              verified={data.eligible}
            />
            <p className="text-2xl font-semibold tabular-nums">
              {(data.currentXp ?? data.totalXp).toLocaleString()}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                XP
              </span>
            </p>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            예약 {data.reservedXp ?? 0} XP · 사용 가능{" "}
            {data.availableXp ?? data.currentXp ?? data.totalXp} XP · 광고
            순소비 {data.spentXp ?? 0} XP
          </p>
          {(data.deficitXp ?? 0) > 0 ? (
            <p className="mt-2 text-sm text-destructive">
              부족분 {data.deficitXp} XP는 이후 적립분에서 먼저 상쇄됩니다.
            </p>
          ) : null}
          <Link
            href="/hero-auctions"
            className="mt-2 inline-block text-sm text-primary underline"
          >
            주간 광고 경매 참여하기
          </Link>
          {data.eligible ? (
            <div className="mt-3">
              <progress
                aria-label="다음 활동 등급까지의 진행률"
                value={Math.min(100, Math.max(0, data.progressPercent))}
                max={100}
                className="h-2 w-full overflow-hidden rounded bg-muted accent-primary"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                {data.nextGrade
                  ? `${ACTIVITY_GRADE_LABELS[data.nextGrade]}까지 ${data.xpToNextGrade.toLocaleString()} XP 남았습니다.`
                  : "최고 등급인 그랜드마스터를 달성했습니다."}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              인게임 캐릭터 인증 후 경험치를 쌓을 수 있습니다. 기존 경험치는
              보존되며 인증 전에는 등급이 표시되지 않습니다.{" "}
              <Link
                className="font-medium text-primary underline underline-offset-4"
                href="/mypage?tab=verification"
              >
                캐릭터 인증하기
              </Link>
            </p>
          )}
          <details className="mt-5 border-t border-border pt-4">
            <summary className="cursor-pointer text-sm font-medium">
              등급 기준 보기
            </summary>
            <table className="mt-3 w-full text-left text-sm">
              <caption className="sr-only">
                현재 경험치에 따른 활동 등급
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="py-2 font-medium">
                    등급
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    필요 현재 경험치
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.grades.map((grade) => (
                  <tr key={grade.code} className="border-t border-border">
                    <th scope="row" className="py-2 font-normal">
                      {grade.label}
                    </th>
                    <td className="py-2 text-right tabular-nums">
                      {grade.minXp.toLocaleString()} XP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </>
      ) : null}
      <div className="mt-5 border-t border-border pt-4">
        <h3 className="text-sm font-semibold">경험치 이력</h3>
        {history.isPending ? (
          <p role="status" className="mt-3 text-sm">
            이력을 불러오는 중입니다.
          </p>
        ) : null}
        {history.isError ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            이력을 불러오지 못했습니다. 새로고침으로 다시 시도해주세요.
          </p>
        ) : null}
        {!history.isPending && !history.isError && items.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            아직 경험치 이력이 없습니다.
          </p>
        ) : null}
        <ul className="mt-2 divide-y divide-border">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-4 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="break-words">{item.activityName}</p>
                <time
                  dateTime={item.occurredAt}
                  className="mt-1 block text-xs text-muted-foreground"
                >
                  {new Date(item.occurredAt).toLocaleString("ko-KR")}
                </time>
              </div>
              <div className="shrink-0 text-right tabular-nums">
                <p
                  className={
                    item.deltaXp < 0 ? "text-destructive" : "text-primary"
                  }
                >
                  {item.deltaXp > 0 ? "+" : ""}
                  {item.deltaXp.toLocaleString()} XP
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  합계 {item.totalXp.toLocaleString()} XP
                </p>
              </div>
            </li>
          ))}
        </ul>
        {history.hasNextPage ? (
          <Button
            variant="outline"
            className="mt-3 w-full"
            disabled={history.isFetchingNextPage}
            onClick={() => void history.fetchNextPage()}
          >
            {history.isFetchingNextPage ? "불러오는 중…" : "이력 더 보기"}
          </Button>
        ) : null}
      </div>
      <HeroTransactionHistory userId={userId} />
    </section>
  );
}
