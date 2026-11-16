"use client";

import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface QueryRefreshControlsProps {
  updatedAt: number;
  isFetching: boolean;
  onRefresh: () => void;
  className?: string;
}

export default function QueryRefreshControls({
  updatedAt,
  isFetching,
  onRefresh,
  className = "",
}: QueryRefreshControlsProps) {
  const lastChecked =
    updatedAt > 0
      ? new Intl.DateTimeFormat("ko-KR", {
          timeZone: "Asia/Seoul",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date(updatedAt))
      : null;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 ${className}`}
    >
      <span className="text-xs text-muted-foreground" aria-live="polite">
        {lastChecked
          ? `마지막 조회 ${lastChecked}`
          : "아직 조회하지 않았습니다"}
        {isFetching ? " · 조회 중..." : ""}
      </span>
      <Button
        type="button"
        variant="outline"
        className="min-h-11 gap-2"
        disabled={isFetching}
        onClick={onRefresh}
      >
        <RefreshCw
          className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          aria-hidden="true"
        />
        새로고침
      </Button>
    </div>
  );
}
