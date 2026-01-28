"use client";

import { Suspense, useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useInfiniteHornBugle } from "@/hooks/useInfiniteHornBugle";
import HornBugleList from "@/components/page/horn-bugle/HornBugleList";
import { HORN_BUGLE_SERVERS } from "@/types/horn-bugle";
import clsx from "clsx";

const SERVER_TABS = ["전체", ...HORN_BUGLE_SERVERS] as const;

// useSearchParams를 사용하는 컴포넌트를 분리
function HornBugleContent() {
  const [selectedServer, setSelectedServer] = useState<string>("전체");
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // URL에서 검색어 읽기
  const urlSearchParams = useSearchParams();
  const keyword = urlSearchParams.get("keyword") || "";

  const fetchParams = useMemo(
    () => ({
      serverName: selectedServer === "전체" ? undefined : selectedServer,
      keyword: keyword || undefined,
    }),
    [selectedServer, keyword]
  );

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteHornBugle(fetchParams);

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

  return (
    <div className="min-h-full bg-[var(--color-ds-background)] -mx-4 md:-mx-6 -my-6 md:-my-8">
      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-4 md:pt-6 pb-8">
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

export default function HornBuglePage() {
  return (
    <Suspense fallback={<HornBugleLoadingFallback />}>
      <HornBugleContent />
    </Suspense>
  );
}

function HornBugleLoadingFallback() {
  return (
    <div className="min-h-full bg-[var(--color-ds-background)] -mx-4 md:-mx-6 -my-6 md:-my-8">
      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-4 md:pt-6 pb-8">
        {/* 서버 탭 스켈레톤 */}
        <div className="mb-6">
          <div className="inline-flex p-1 rounded-xl bg-gray-100 gap-1">
            {SERVER_TABS.map((server) => (
              <div
                key={server}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400"
              >
                {server}
              </div>
            ))}
          </div>
        </div>
        {/* 로딩 표시 */}
        <div className="text-sm text-gray-400 text-center py-8">로딩 중...</div>
      </div>
    </div>
  );
}
