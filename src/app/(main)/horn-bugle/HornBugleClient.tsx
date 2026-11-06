"use client";

import clsx from "clsx";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FormEvent,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import HornBugleList from "@/components/page/horn-bugle/HornBugleList";
import { useInfiniteHornBugle } from "@/hooks/useInfiniteHornBugle";
import { HORN_BUGLE_SERVERS } from "@/types/horn-bugle";

const SERVER_TABS = ["전체", ...HORN_BUGLE_SERVERS] as const;

// useSearchParams를 사용하는 컴포넌트를 분리
function HornBugleContent() {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedServer, setSelectedServer] = useState<string>("전체");
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // URL에서 검색어 읽기
  const urlSearchParams = useSearchParams();
  const keyword = urlSearchParams.get("keyword") || "";
  const [searchInput, setSearchInput] = useState(keyword);

  useEffect(() => setSearchInput(keyword), [keyword]);

  const replaceKeyword = (nextKeyword: string) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    const trimmedKeyword = nextKeyword.trim();
    if (trimmedKeyword) params.set("keyword", trimmedKeyword);
    else params.delete("keyword");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    replaceKeyword(searchInput);
  };

  const fetchParams = useMemo(
    () => ({
      serverName: selectedServer === "전체" ? undefined : selectedServer,
      keyword: keyword || undefined,
    }),
    [selectedServer, keyword],
  );

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteHornBugle(fetchParams);

  const allItems = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const itemCountLabel = hasNextPage
    ? `현재 ${allItems.length}개의 메시지 표시 중`
    : `총 ${allItems.length}개의 메시지`;

  // 무한 스크롤
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="min-h-full bg-[var(--color-ds-background)] dark:bg-navy-900 -mx-4 md:-mx-6 -my-6 md:-my-8">
      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-4 md:pt-6 pb-8">
        <form
          role="search"
          aria-label="거대한 뿔피리 검색"
          onSubmit={submitSearch}
          className="mb-4 flex items-center gap-2"
        >
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="사용자명, 메시지, 서버명 검색"
              aria-label="뿔피리 통합 검색어"
              className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  replaceKeyword("");
                }}
                aria-label="검색어 지우기"
                className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="h-[18px] w-[18px]" aria-hidden="true" />
              </button>
            ) : null}
          </div>
          <button
            type="submit"
            className="h-11 shrink-0 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-[var(--color-ds-primary-hover)]"
          >
            검색
          </button>
        </form>

        {/* 서버 탭 */}
        <div className="mb-6">
          <div className="inline-flex p-1 rounded-lg bg-gray-100 dark:bg-navy-700 gap-1">
            {SERVER_TABS.map((server) => (
              <button
                key={server}
                onClick={() => setSelectedServer(server)}
                className={clsx(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  selectedServer === server
                    ? "bg-[var(--color-ds-card)] text-[var(--color-ds-primary)]"
                    : "text-[var(--color-ds-secondary)] hover:text-[var(--color-ds-text)]",
                )}
              >
                {server}
              </button>
            ))}
          </div>
        </div>

        {/* 결과 카운트 */}
        {allItems.length > 0 && (
          <div className="mb-4 text-sm text-muted-foreground">
            {itemCountLabel}
          </div>
        )}

        {/* 리스트 */}
        <HornBugleList items={allItems} isLoading={isLoading} />

        {/* 무한 스크롤 트리거 */}
        <div
          ref={loadMoreRef}
          className="h-20 flex items-center justify-center"
        >
          {isFetchingNextPage && (
            <div className="text-sm text-muted-foreground">로딩 중...</div>
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
    <div className="min-h-full bg-[var(--color-ds-background)] dark:bg-navy-900 -mx-4 md:-mx-6 -my-6 md:-my-8">
      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-4 md:pt-6 pb-8">
        {/* 서버 탭 스켈레톤 */}
        <div className="mb-6">
          <div className="inline-flex p-1 rounded-lg bg-gray-100 dark:bg-navy-700 gap-1">
            {SERVER_TABS.map((server) => (
              <div
                key={server}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground"
              >
                {server}
              </div>
            ))}
          </div>
        </div>
        {/* 로딩 표시 */}
        <div className="text-sm text-muted-foreground text-center py-8">
          로딩 중...
        </div>
      </div>
    </div>
  );
}
