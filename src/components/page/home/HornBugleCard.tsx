"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useLatestHornBugle } from "@/hooks/useLatestHornBugle";

import styles from "./HomeCards.module.css";
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
    <div className={`${styles.card} h-full`}>
      <div className={styles.heading}>
        <div>
          <h3 className={styles.title}>거대한 뿔피리</h3>
          <p className={styles.meta}>에린에서 지금 들려오는 이야기</p>
        </div>
        <Link
          href="/horn-bugle"
          aria-label="거대한 뿔피리 더보기"
          className="inline-flex min-h-11 items-center rounded px-2 text-xs text-muted-foreground hover:underline focus-visible:outline-2"
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
        <div className="min-w-0">
          {data.slice(0, 7).map((item) => (
            <div key={item.id} className={styles.hornRow}>
              <div className={styles.hornMeta}>
                <span className={styles.server}>{item.serverName}</span>
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
              <p className={styles.hornText}>{item.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
