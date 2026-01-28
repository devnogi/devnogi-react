"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useInfiniteHornBugle } from "@/hooks/useInfiniteHornBugle";
import HornBugleList from "@/components/page/horn-bugle/HornBugleList";
import { HORN_BUGLE_SERVERS } from "@/types/horn-bugle";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import clsx from "clsx";

const SERVER_TABS = ["전체", ...HORN_BUGLE_SERVERS] as const;

export default function HornBuglePage() {
  const [selectedServer, setSelectedServer] = useState<string>("전체");
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 디바운스 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const searchParams = useMemo(
    () => ({
      serverName: selectedServer === "전체" ? undefined : selectedServer,
      keyword: debouncedKeyword || undefined,
    }),
    [selectedServer, debouncedKeyword]
  );

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteHornBugle(searchParams);

  const allItems = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  const totalElements = data?.pages[0]?.meta.totalElements ?? 0;

  // 무한 스크롤
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleClearKeyword = useCallback(() => {
    setKeyword("");
  }, []);

  return (
    <div className="min-h-full bg-[var(--color-ds-background)] -mx-4 md:-mx-6 -my-6 md:-my-8">
      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-4 md:pt-6 pb-8">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            거대한 뿔피리
          </h1>
          <p className="text-sm text-gray-500">
            에린 전역에 울려퍼지는 뿔피리 메시지를 확인하세요.
          </p>
        </div>

        {/* 검색 */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="캐릭터명, 메시지 검색..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="h-12 pl-11 pr-10 rounded-xl border-gray-300 focus:border-blaanid-500 focus:ring-2 focus:ring-blaanid-500/20"
              maxLength={50}
            />
            {keyword && (
              <button
                onClick={handleClearKeyword}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 서버 탭 */}
        <div className="mb-6">
          <div className="inline-flex p-1 rounded-xl bg-gray-100 gap-1">
            {SERVER_TABS.map((server) => (
              <button
                key={server}
                onClick={() => setSelectedServer(server)}
                className={clsx(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  selectedServer === server
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {server}
              </button>
            ))}
          </div>
        </div>

        {/* 결과 카운트 */}
        {totalElements > 0 && (
          <div className="mb-4 text-sm text-gray-500">
            총 <span className="font-semibold">{totalElements}</span>개의 메시지
          </div>
        )}

        {/* 리스트 */}
        <HornBugleList items={allItems} isLoading={isLoading} />

        {/* 무한 스크롤 트리거 */}
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          {isFetchingNextPage && (
            <div className="text-sm text-gray-400">로딩 중...</div>
          )}
        </div>
      </div>
    </div>
  );
}
