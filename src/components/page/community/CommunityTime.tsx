"use client";

import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/** The server and first client render must not depend on a clock or timezone. */
export default function CommunityTime({ value }: { value: string }) {
  const hydrated = useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot,
  );
  // Community's LocalDateTime fields use the Asia/Seoul wall clock. Keep
  // explicit ISO offsets intact and never interpret offset-free values locally.
  const iso = value.replace(" ", "T");
  const timestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(iso)
    ? `${iso}+09:00`
    : iso;
  let label = value.slice(0, 10);
  if (hydrated) {
    const date = new Date(timestamp);
    if (!Number.isNaN(date.getTime())) {
      label = formatDistanceToNow(date, { addSuffix: true, locale: ko });
    }
  }
  return <time dateTime={timestamp}>{label}</time>;
}
