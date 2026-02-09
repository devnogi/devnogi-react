"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Heart,
  MessageCircle,
  Reply,
  Megaphone,
  Info,
  Gift,
  Flag,
  ShieldAlert,
  ExternalLink,
  Filter,
} from "lucide-react";
import clsx from "clsx";
import { Notice, NoticeType } from "@/types/notice";
import { useNotices } from "@/hooks/useNotices";

const NOTICE_TYPE_CONFIG: Record<
  NoticeType,
  { icon: typeof Bell; label: string; color: string; bgColor: string }
> = {
  POST_LIKE: {
    icon: Heart,
    label: "게시글 좋아요",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/30",
  },
  POST_COMMENT: {
    icon: MessageCircle,
    label: "댓글",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  COMMENT_REPLY: {
    icon: Reply,
    label: "답글",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  COMMENT_LIKE: {
    icon: Heart,
    label: "댓글 좋아요",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/30",
  },
  ANNOUNCEMENT: {
    icon: Megaphone,
    label: "공지",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
  },
  SYSTEM: {
    icon: Info,
    label: "시스템",
    color: "text-gray-500",
    bgColor: "bg-gray-50 dark:bg-gray-800",
  },
  EVENT: {
    icon: Gift,
    label: "이벤트",
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
  REPORT_RESULT: {
    icon: Flag,
    label: "신고 결과",
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
  },
  POST_BLOCKED: {
    icon: ShieldAlert,
    label: "게시글 제한",
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/30",
  },
  COMMENT_BLOCKED: {
    icon: ShieldAlert,
    label: "댓글 제한",
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/30",
  },
};

const DAY_OPTIONS = [
  { value: 7, label: "7일" },
  { value: 14, label: "14일" },
  { value: 30, label: "30일" },
];

const TYPE_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "POST_LIKE", label: "게시글 좋아요" },
  { value: "POST_COMMENT", label: "댓글" },
  { value: "COMMENT_REPLY", label: "답글" },
  { value: "COMMENT_LIKE", label: "댓글 좋아요" },
  { value: "ANNOUNCEMENT", label: "공지" },
  { value: "SYSTEM", label: "시스템" },
  { value: "EVENT", label: "이벤트" },
];

function getDateGroup(dateString: string): string {
  const date = new Date(dateString.replace(" ", "T"));
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  if (date >= today) return "오늘";
  if (date >= yesterday) return "어제";
  if (date >= weekAgo) return "이번 주";
  return "이전";
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString.replace(" ", "T"));
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return dateString.split(" ")[0];
}

interface NotificationListProps {
  userId: number | undefined;
}

export default function NotificationList({ userId }: NotificationListProps) {
  const [day, setDay] = useState(7);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const router = useRouter();

  const { data: notices = [], isLoading } = useNotices(userId, day);

  const filteredNotices = useMemo(() => {
    if (typeFilter === "ALL") return notices;
    return notices.filter((n) => n.noticeType === typeFilter);
  }, [notices, typeFilter]);

  const groupedNotices = useMemo(() => {
    const groups: Record<string, Notice[]> = {};
    const order = ["오늘", "어제", "이번 주", "이전"];

    for (const notice of filteredNotices) {
      const group = getDateGroup(notice.createdAt);
      if (!groups[group]) groups[group] = [];
      groups[group].push(notice);
    }

    return order
      .filter((key) => groups[key]?.length)
      .map((key) => ({ label: key, notices: groups[key] }));
  }, [filteredNotices]);

  const unreadCount = notices.filter((n) => !n.isRead).length;

  const handleNoticeClick = (notice: Notice) => {
    const pageUrl = notice.url.replace("/api", "");
    router.push(pageUrl);
  };

  const getNoticeConfig = (noticeType?: NoticeType) => {
    if (!noticeType || !NOTICE_TYPE_CONFIG[noticeType]) {
      return {
        icon: Bell,
        label: "알림",
        color: "text-gray-500",
        bgColor: "bg-gray-50 dark:bg-gray-800",
      };
    }
    return NOTICE_TYPE_CONFIG[noticeType];
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-200 dark:border-navy-600 p-8">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              알림을 불러오는 중...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header + Filters */}
      <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-200 dark:border-navy-600 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              알림 센터
            </h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-full">
                {unreadCount}개 읽지 않음
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
            <select
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className="h-9 px-3 text-sm border border-gray-200 dark:border-navy-500 rounded-xl bg-white dark:bg-navy-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DAY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  최근 {opt.label}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 px-3 text-sm border border-gray-200 dark:border-navy-500 rounded-xl bg-white dark:bg-navy-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TYPE_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notification Groups */}
      {groupedNotices.length === 0 ? (
        <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-200 dark:border-navy-600 p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <Bell className="w-12 h-12 text-gray-300 dark:text-navy-500 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              알림이 없습니다
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              최근 {day}일 간 받은 알림이 없습니다
            </p>
          </div>
        </div>
      ) : (
        groupedNotices.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-2">
              {group.label}
            </p>
            <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-200 dark:border-navy-600 overflow-hidden">
              {group.notices.map((notice, idx) => {
                const config = getNoticeConfig(notice.noticeType);
                const Icon = config.icon;

                return (
                  <button
                    key={notice.id}
                    onClick={() => handleNoticeClick(notice)}
                    className={clsx(
                      "w-full text-left px-5 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-navy-700 flex items-start gap-4",
                      idx < group.notices.length - 1 &&
                        "border-b border-gray-100 dark:border-navy-600",
                      !notice.isRead &&
                        "bg-blue-50/40 dark:bg-blue-950/20"
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={clsx(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                        config.bgColor
                      )}
                    >
                      <Icon className={clsx("w-5 h-5", config.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p
                          className={clsx(
                            "text-sm font-medium truncate",
                            !notice.isRead
                              ? "text-gray-900 dark:text-gray-100"
                              : "text-gray-600 dark:text-gray-400"
                          )}
                        >
                          {notice.title}
                        </p>
                        {!notice.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {notice.contents}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {formatRelativeTime(notice.createdAt)}
                        </span>
                        {notice.noticeType && (
                          <span
                            className={clsx(
                              "text-xs px-1.5 py-0.5 rounded-md font-medium",
                              config.bgColor,
                              config.color
                            )}
                          >
                            {config.label}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ExternalLink className="w-4 h-4 text-gray-300 dark:text-navy-500 flex-shrink-0 mt-1" />
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
