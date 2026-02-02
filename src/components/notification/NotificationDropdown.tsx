"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, X, ExternalLink } from "lucide-react";
import clsx from "clsx";
import { Notice } from "@/types/notice";
import { useNotices } from "@/hooks/useNotices";

interface NotificationDropdownProps {
  userId: number | undefined;
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export default function NotificationDropdown({
  userId,
  isOpen,
  onClose,
  onToggle,
}: NotificationDropdownProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { data: notices = [], isLoading } = useNotices(userId, 7);
  const unreadCount = notices.filter((n) => !n.isRead).length;
  const recentNotices = notices.slice(0, 5);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleNoticeClick = (notice: Notice) => {
    onClose();
    // URL에서 /api 제거하고 실제 페이지 경로로 변환
    const pageUrl = notice.url.replace("/api", "");
    router.push(pageUrl);
  };

  const handleViewAll = () => {
    onClose();
    router.push("/mypage?tab=notifications");
  };

  // 상대 시간 포맷팅
  const formatRelativeTime = (dateString: string) => {
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
    return dateString.split(" ")[0]; // yyyy-MM-dd
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={onToggle}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
        aria-label="알림"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-xs font-medium rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden z-50"
          role="menu"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">알림</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                  {unreadCount}개 새 알림
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="닫기"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-[320px] overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-8 text-center">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">알림을 불러오는 중...</p>
              </div>
            ) : recentNotices.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">새로운 알림이 없습니다</p>
              </div>
            ) : (
              recentNotices.map((notice) => (
                <button
                  key={notice.id}
                  onClick={() => handleNoticeClick(notice)}
                  className={clsx(
                    "w-full text-left px-4 py-3 border-b border-gray-50 last:border-b-0 transition-colors hover:bg-gray-50",
                    !notice.isRead && "bg-blue-50/50"
                  )}
                  role="menuitem"
                >
                  <div className="flex items-start gap-3">
                    {/* Read indicator */}
                    <div className="flex-shrink-0 mt-1.5">
                      {!notice.isRead ? (
                        <span className="block w-2 h-2 bg-blue-500 rounded-full" />
                      ) : (
                        <span className="block w-2 h-2 bg-gray-300 rounded-full" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={clsx(
                          "text-sm font-medium truncate",
                          !notice.isRead ? "text-gray-900" : "text-gray-600"
                        )}
                      >
                        {notice.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {notice.contents}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatRelativeTime(notice.createdAt)}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {recentNotices.length > 0 && (
            <div className="border-t border-gray-100">
              <button
                onClick={handleViewAll}
                className="w-full px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors text-center"
              >
                모든 알림 보기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
