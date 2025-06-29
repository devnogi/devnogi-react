'use client';

import { ChannelInfo } from '@/types/post';
import { Button } from '@/components/ui/button';
import { BookOpen, Bell, Plus, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostListHeaderProps {
  channelInfo: ChannelInfo;
  className?: string;
}

export const PostListHeader = ({ channelInfo, className }: PostListHeaderProps) => {
  return (
    <div className={cn('border-b border-gray-200 pb-4', className)}>
      <div className="flex items-start gap-4">
        {/* 채널 아이콘 */}
        <div className="flex-shrink-0">
          <img
            src={channelInfo.icon}
            alt={`${channelInfo.name} 아이콘`}
            className="w-12 h-12 rounded-lg object-cover"
          />
        </div>

        {/* 채널 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-xl font-semibold text-gray-900 truncate">
              {channelInfo.name}
            </h1>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              title="채널 정보"
            >
              <span className="sr-only">채널 정보</span>
              <BookOpen className="h-4 w-4" />
            </Button>
          </div>

          {/* 채널 통계 */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
            <span>구독자 {channelInfo.subscriberCount.toLocaleString()}명</span>
            <span className="text-gray-400">•</span>
            <span>알림수신 {channelInfo.notificationCount.toLocaleString()}명</span>
            <span className="text-gray-400">•</span>
            <span className="flex items-center gap-1">
              <span>@{channelInfo.manager.nickname}</span>
              {channelInfo.manager.isManager && (
                <span className="text-blue-600" title="매니저">
                  👑
                </span>
              )}
            </span>
          </div>

          {/* 채널 설명 */}
          <p className="text-sm text-gray-700">
            {channelInfo.description}
          </p>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* 채널 위키 버튼 */}
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <BookOpen className="h-4 w-4 mr-1" />
            <span>채널위키</span>
          </Button>

          {/* 알림 버튼 */}
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">알림</span>
          </Button>

          {/* 구독 버튼 */}
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">구독</span>
          </Button>
        </div>
      </div>
    </div>
  );
}; 