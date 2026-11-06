"use client";

import { Megaphone } from "lucide-react";

import { HornBugleItem } from "@/types/horn-bugle";

interface HornBugleListProps {
  items: HornBugleItem[];
  isLoading: boolean;
}

// 서버별 배지 색상 (라이트/다크 모드 대응)
const serverColors: Record<string, string> = {
  류트: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  만돌린:
    "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  하프: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
  울프: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

export default function HornBugleList({
  items,
  isLoading,
}: HornBugleListProps) {
  if (isLoading && items.length === 0) {
    return (
      <div
        role="status"
        aria-label="뿔피리를 불러오는 중"
        className="overflow-hidden rounded-lg border border-gray-200 bg-white divide-y divide-gray-100 dark:border-navy-600 dark:bg-navy-800 dark:divide-navy-600"
      >
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-4 py-2 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-navy-600 rounded w-24" />
                <div className="h-5 bg-gray-200 dark:bg-navy-600 rounded w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <Megaphone className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          뿔피리 내역이 없습니다.
        </p>
      </div>
    );
  }

  // KST 시간 그대로 표시 (타임존 변환 없음)
  const formatTime = (dateString: string) => {
    const match = dateString.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (!match) return "";
    const [, , month, day, hour, minute] = match;
    return `${month}.${day} ${hour}:${minute}`;
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white divide-y divide-gray-100 dark:border-navy-600 dark:bg-navy-800 dark:divide-navy-600">
      {items.map((item) => (
        <div key={item.id} className="px-4 py-2">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              {/* 헤더: 서버 배지 + 캐릭터명 */}
              <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${serverColors[item.serverName] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}
                >
                  {item.serverName}
                </span>
                <span className="min-w-0 max-w-full break-words font-semibold text-gray-900 dark:text-white text-sm">
                  {item.characterName}
                </span>
                <time
                  dateTime={item.dateSend}
                  className="ml-auto text-xs text-gray-500 dark:text-gray-400"
                >
                  {formatTime(item.dateSend)}
                </time>
              </div>

              {/* 메시지 */}
              <p className="text-gray-700 dark:text-gray-300 text-[13px] leading-5 break-words whitespace-pre-wrap">
                {item.message.startsWith(`${item.characterName} : `)
                  ? item.message.slice(item.characterName.length + 3)
                  : item.message}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
