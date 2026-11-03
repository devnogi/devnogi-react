"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useLatestHornBugle } from "@/hooks/useLatestHornBugle";

import RankingCardSkeleton from "./RankingCardSkeleton";

function formatTime(dateString: string, now: number) {
  // The horn mapper adds nine hours before serializing its Instant with Z.
  const sentAt = Date.parse(dateString.replace(/Z$/, "+09:00"));
  if (!Number.isFinite(sentAt)) return "";
  const minutes = Math.floor((now - sentAt) / 60_000);
  return minutes < 1 ? "방금 전" : `${minutes}분 전`;
}

export default function HornBugleCard() {
  const { data, isLoading, error } = useLatestHornBugle();
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="h-full min-w-0 rounded-lg border border-gray-200 bg-[var(--color-ds-card)] p-4 dark:border-navy-600 dark:bg-navy-800">
      <div className="mb-2 grid grid-cols-[1fr_auto] items-center">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
          거대한 뿔피리
        </h3>
        <Link
          href="/horn-bugle"
          aria-label="거대한 뿔피리 더보기"
          className="rounded px-2 py-1 text-xs font-medium text-gray-600 hover:underline focus-visible:outline-2 dark:text-gray-300"
        >
          더보기
        </Link>
      </div>
      {isLoading ? (
        <RankingCardSkeleton rows={7} compact />
      ) : error ? (
        <div className="py-8 text-center text-sm text-gray-600 dark:text-gray-300">
          데이터를 불러올 수 없습니다
        </div>
      ) : !data || data.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-600 dark:text-gray-300">
          뿔피리 내역이 없습니다
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-navy-600">
          {data.slice(0, 7).map((item) => (
            <div
              key={item.id}
              className="flex h-10 min-w-0 flex-col justify-center"
            >
              <div className="flex min-w-0 items-center gap-2 text-[11px] leading-4 text-gray-600 dark:text-gray-300">
                <span className="shrink-0 font-semibold text-[#9a451f] dark:text-orange-300">
                  {item.serverName}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  {item.characterName}
                </span>
                <time
                  className="shrink-0 tabular-nums"
                  dateTime={item.dateSend.replace(/Z$/, "+09:00")}
                >
                  {formatTime(item.dateSend, now)}
                </time>
              </div>
              <p className="truncate text-[13px] leading-[18px] text-gray-900 dark:text-gray-100">
                {item.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
