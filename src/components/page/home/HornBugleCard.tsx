"use client";

import { useLatestHornBugle } from "@/hooks/useLatestHornBugle";

import RankingCardSkeleton from "./RankingCardSkeleton";

function formatTime(dateString: string) {
  const match = dateString.match(/\d{4}-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  return match ? `${match[1]}.${match[2]} ${match[3]}:${match[4]}` : "";
}

export default function HornBugleCard() {
  const { data, isLoading, error } = useLatestHornBugle();

  return (
    <div className="h-full min-w-0 rounded-lg border border-gray-200 bg-[var(--color-ds-card)] p-5 dark:border-navy-600 dark:bg-navy-800">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-50">
          거대한 뿔피리
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          전체 서버 최신 메시지
        </p>
      </div>
      {isLoading ? (
        <RankingCardSkeleton rows={7} />
      ) : error ? (
        <div className="py-8 text-center text-sm text-gray-600 dark:text-gray-300">
          데이터를 불러올 수 없습니다
        </div>
      ) : !data || data.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-600 dark:text-gray-300">
          뿔피리 내역이 없습니다
        </div>
      ) : (
        <div className="space-y-2">
          {data.slice(0, 7).map((item) => (
            <div key={item.id} className="min-w-0 rounded-xl p-2.5">
              <div className="flex min-w-0 items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                <span className="shrink-0 font-semibold text-[#9a451f] dark:text-orange-300">
                  {item.serverName}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  {item.characterName}
                </span>
                <time
                  className="shrink-0 tabular-nums"
                  dateTime={item.dateSend}
                >
                  {formatTime(item.dateSend)}
                </time>
              </div>
              <p className="truncate text-sm text-gray-900 dark:text-gray-100">
                {item.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
