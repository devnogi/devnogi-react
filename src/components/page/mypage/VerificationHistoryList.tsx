"use client";

import { useState } from "react";
import { useVerificationHistory } from "@/hooks/useUserVerification";
import {
  History,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  Server,
  Gamepad2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

interface VerificationHistoryListProps {
  enabled: boolean;
}

export default function VerificationHistoryList({
  enabled,
}: VerificationHistoryListProps) {
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  const [limit, setLimit] = useState(10);

  const { data, isLoading } = useVerificationHistory(sort, limit, enabled);

  const toggleSort = () => setSort((prev) => (prev === "desc" ? "asc" : "desc"));

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-200 dark:border-navy-600 p-5 sm:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-navy-600 rounded w-1/3" />
          <div className="h-12 bg-gray-200 dark:bg-navy-600 rounded" />
          <div className="h-12 bg-gray-200 dark:bg-navy-600 rounded" />
        </div>
      </div>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-200 dark:border-navy-600 p-5 sm:p-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
            <History className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            인증 이력
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="text-sm bg-gray-50 dark:bg-navy-700 border border-gray-200 dark:border-navy-600 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300"
          >
            <option value={5}>5개</option>
            <option value={10}>10개</option>
            <option value={20}>20개</option>
          </select>
          <Button
            onClick={toggleSort}
            variant="ghost"
            size="icon-sm"
            className="text-gray-500 dark:text-gray-400"
            title={sort === "desc" ? "오래된순" : "최신순"}
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <History className="w-12 h-12 text-gray-300 dark:text-navy-500 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            인증 이력이 없습니다
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.historyId}
              className={clsx(
                "rounded-2xl border p-4",
                item.verificationSuccess
                  ? "border-green-100 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10"
                  : "border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {item.verificationSuccess ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
                  )}
                  <div>
                    <p
                      className={clsx(
                        "text-sm font-medium",
                        item.verificationSuccess
                          ? "text-green-700 dark:text-green-400"
                          : "text-red-700 dark:text-red-400"
                      )}
                    >
                      {item.verificationSuccess ? "인증 성공" : "인증 실패"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {formatDate(item.verifiedAt)}
                    </p>
                  </div>
                </div>

                {(item.serverName || item.characterName) && (
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    {item.serverName && (
                      <span className="flex items-center gap-1">
                        <Server className="w-3 h-3" />
                        {item.serverName}
                      </span>
                    )}
                    {item.characterName && (
                      <span className="flex items-center gap-1">
                        <Gamepad2 className="w-3 h-3" />
                        {item.characterName}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {item.failureReason && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2 ml-7.5">
                  사유: {item.failureReason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
