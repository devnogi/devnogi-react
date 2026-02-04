"use client";

import { HornBugleItem } from "@/types/horn-bugle";
import { Megaphone } from "lucide-react";

interface HornBugleListProps {
  items: HornBugleItem[];
  isLoading: boolean;
}

// 서버별 배지 색상 (라이트/다크 모드 대응)
const serverColors: Record<string, string> = {
  류트: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  만돌린: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  하프: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
  울프: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

export default function HornBugleList({ items, isLoading }: HornBugleListProps) {
  if (isLoading && items.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-navy-700 rounded-[20px] border border-gray-200 dark:border-navy-600 p-5 animate-pulse"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-navy-600 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-navy-600 rounded w-24" />
                <div className="h-5 bg-gray-200 dark:bg-navy-600 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-navy-600 rounded w-20" />
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
        <p className="text-gray-500 dark:text-gray-400">뿔피리 내역이 없습니다.</p>
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
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white dark:bg-navy-700 rounded-[20px] border border-gray-200 dark:border-navy-600 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:border-gray-300 dark:hover:border-navy-500 transition-all p-5"
        >
          <div className="flex items-start gap-4">
            {/* 아이콘 */}
            <div className="w-10 h-10 rounded-full bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center flex-shrink-0">
              <Megaphone className="w-5 h-5 text-gold-600 dark:text-gold-400" />
            </div>

            {/* 내용 */}
            <div className="flex-1 min-w-0">
              {/* 헤더: 서버 배지 + 캐릭터명 */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${serverColors[item.serverName] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}
                >
                  {item.serverName}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {item.characterName}
                </span>
              </div>

              {/* 메시지 */}
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed break-words whitespace-pre-wrap">
                {item.message}
              </p>

              {/* 시간 */}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                {formatTime(item.dateSend)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
