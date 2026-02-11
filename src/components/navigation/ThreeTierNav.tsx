"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  type ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { toast } from "sonner";
import clsx from "clsx";
import { Search, Sun, Moon, User, Home, X, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useItemInfos, ItemInfo } from "@/hooks/useItemInfos";
import {
  useRecentSearches,
  RecentSearch,
} from "@/hooks/useRecentSearches";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import NotificationDropdown from "@/components/notification/NotificationDropdown";

// Navigation menu items
const navItems = [
  { href: "/auction-history", label: "경매장 거래내역", ready: true },
  { href: "/community", label: "게시판", ready: true },
  { href: "/auction-realtime", label: "경매장 실시간 정보", ready: true },
  { href: "/statistics", label: "시세 정보", ready: true },
  { href: "/horn-bugle", label: "거대한 뿔피리", ready: true },
  { href: "/item-info", label: "아이템 정보", ready: true },
];

const SHARED_SEARCH_ROUTE_SET = new Set([
  "/auction-history",
  "/auction-realtime",
  "/statistics",
  "/item-info",
]);

type SharedSearchContext = {
  itemName: string;
  topCategory: string;
  subCategory: string;
};

function firstNonEmpty(values: Array<string | null>) {
  return values.find((value) => value && value.trim().length > 0) ?? "";
}

function readSharedSearchContext(
  params: ReadonlyURLSearchParams,
): SharedSearchContext {
  return {
    itemName: firstNonEmpty([
      params.get("item_name"),
      params.get("itemName"),
      params.get("name"),
    ]),
    topCategory: firstNonEmpty([
      params.get("top_category"),
      params.get("itemTopCategory"),
      params.get("topCategory"),
    ]),
    subCategory: firstNonEmpty([
      params.get("sub_category"),
      params.get("itemSubCategory"),
      params.get("subCategory"),
    ]),
  };
}

export default function ThreeTierNav() {
  const pathname = usePathname();
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Search states
  const [searchValue, setSearchValue] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Recent searches hook
  const {
    recentSearches,
    addRecentSearch,
    clearAllRecentSearches,
    refreshRecentSearches,
  } = useRecentSearches();

  // Item data for autocomplete
  const { data: itemInfos = [], isLoading } = useItemInfos();

  // 경매장 거래내역 페이지인지 확인
  const isAuctionHistoryPage = pathname.startsWith("/auction-history");
  // 경매장 실시간 정보 페이지인지 확인
  const isAuctionRealtimePage = pathname.startsWith("/auction-realtime");
  // 경매장 관련 페이지인지 확인 (거래내역 또는 실시간)
  const isAuctionPage = isAuctionHistoryPage || isAuctionRealtimePage;
  // 뿔피리 페이지인지 확인
  const isHornBuglePage = pathname.startsWith("/horn-bugle");
  // 아이템 정보 페이지인지 확인
  const isItemInfoPage = pathname.startsWith("/item-info");
  // 게시판 페이지인지 확인
  const isCommunityPage = pathname.startsWith("/community");
  // 시세 정보 페이지인지 확인
  const isStatisticsPage = pathname.startsWith("/statistics");
  // 검색 가능한 페이지 (경매장 + 아이템 정보 + 시세 정보)
  const isSearchablePage = isAuctionPage || isItemInfoPage || isStatisticsPage;
  const sharedSearchContext = useMemo(
    () => readSharedSearchContext(urlSearchParams),
    [urlSearchParams],
  );

  // Filtered items based on search input
  const filteredItems = useMemo(() => {
    if (!isSearchablePage) return [];
    if (!searchValue || searchValue.trim().length === 0) {
      return [];
    }
    const searchTerm = searchValue.toLowerCase().trim();
    return itemInfos
      .filter((item) => item.name.toLowerCase().includes(searchTerm))
      .slice(0, 10);
  }, [itemInfos, searchValue, isSearchablePage]);

  // Scroll detection for hiding Tier 1
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset selected index when search value changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchValue]);

  useEffect(() => {
    if (isSearchablePage) {
      setSearchValue(sharedSearchContext.itemName);
      return;
    }

    if (isHornBuglePage) {
      setSearchValue(urlSearchParams.get("keyword") || "");
      return;
    }

    if (isCommunityPage) {
      setSearchValue(urlSearchParams.get("q") || "");
      return;
    }

    setSearchValue("");
  }, [
    isSearchablePage,
    isHornBuglePage,
    isCommunityPage,
    sharedSearchContext.itemName,
    urlSearchParams,
  ]);

  const buildSharedSearchPath = useCallback(
    (targetPath: string) => {
      if (!SHARED_SEARCH_ROUTE_SET.has(targetPath)) {
        return targetPath;
      }

      if (pathname === targetPath) {
        const currentQuery = urlSearchParams.toString();
        return currentQuery ? `${targetPath}?${currentQuery}` : targetPath;
      }

      const params = new URLSearchParams();

      if (sharedSearchContext.itemName) {
        params.set("item_name", sharedSearchContext.itemName);
      }
      if (sharedSearchContext.topCategory) {
        params.set("top_category", sharedSearchContext.topCategory);
      }
      if (sharedSearchContext.subCategory) {
        params.set("sub_category", sharedSearchContext.subCategory);
      }
      if (
        targetPath === "/statistics" &&
        (sharedSearchContext.itemName ||
          sharedSearchContext.topCategory ||
          sharedSearchContext.subCategory)
      ) {
        params.set("tab", "item");
      }

      const query = params.toString();
      return query ? `${targetPath}?${query}` : targetPath;
    },
    [pathname, sharedSearchContext, urlSearchParams],
  );

  const handleNotReady = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    toast("죄송합니다. 해당 메뉴는 오픈 준비 중입니다", {
      description: "빠른 시일 내에 준비하겠습니다!",
    });
  };

  const handleItemSelect = useCallback(
    (item: ItemInfo) => {
      setSearchValue(item.name);
      addRecentSearch({
        itemName: item.name,
        topCategory: item.topCategory,
        subCategory: item.subCategory,
      });
      setIsSearchFocused(false);
      setSelectedIndex(-1);

      // 아이템 정보 페이지인 경우
      if (isItemInfoPage) {
        const params = new URLSearchParams({
          item_name: item.name,
          top_category: item.topCategory,
          sub_category: item.subCategory,
        });
        router.push(`/item-info?${params.toString()}`);
        return;
      }

      // 시세 정보 페이지인 경우 (item 탭으로 강제 전환)
      if (isStatisticsPage) {
        const params = new URLSearchParams({
          tab: "item",
          item_name: item.name,
          top_category: item.topCategory,
          sub_category: item.subCategory,
        });
        router.push(`/statistics?${params.toString()}`);
        return;
      }

      // Navigate to current auction page with search params (history or realtime)
      const basePath = isAuctionRealtimePage ? "/auction-realtime" : "/auction-history";
      const params = new URLSearchParams({
        item_name: item.name,
        top_category: item.topCategory,
        sub_category: item.subCategory,
      });
      router.push(`${basePath}?${params.toString()}`);
    },
    [addRecentSearch, router, isAuctionRealtimePage, isItemInfoPage, isStatisticsPage]
  );

  const handleRecentSearchClick = useCallback(
    (search: RecentSearch) => {
      setSearchValue(search.itemName);
      addRecentSearch(search);
      setIsSearchFocused(false);
      setSelectedIndex(-1);

      // 아이템 정보 페이지인 경우
      if (isItemInfoPage) {
        const params = new URLSearchParams();
        params.set("item_name", search.itemName);
        if (search.topCategory) {
          params.set("top_category", search.topCategory);
        }
        if (search.subCategory) {
          params.set("sub_category", search.subCategory);
        }
        router.push(`/item-info?${params.toString()}`);
        return;
      }

      // 시세 정보 페이지인 경우 (카테고리 정보가 있는 최근 검색어만 허용)
      if (isStatisticsPage) {
        if (!search.topCategory || !search.subCategory) {
          toast("시세 정보에서는 목록의 아이템을 선택해주세요.");
          return;
        }
        const params = new URLSearchParams({
          tab: "item",
          item_name: search.itemName,
          top_category: search.topCategory,
          sub_category: search.subCategory,
        });
        router.push(`/statistics?${params.toString()}`);
        return;
      }

      const basePath = isAuctionRealtimePage ? "/auction-realtime" : "/auction-history";
      const params = new URLSearchParams({
        item_name: search.itemName,
      });
      if (search.topCategory) {
        params.set("top_category", search.topCategory);
      }
      if (search.subCategory) {
        params.set("sub_category", search.subCategory);
      }
      router.push(`${basePath}?${params.toString()}`);
    },
    [addRecentSearch, router, isAuctionRealtimePage, isItemInfoPage, isStatisticsPage]
  );

  const handleClearAllRecentSearches = useCallback(() => {
    clearAllRecentSearches();
  }, [clearAllRecentSearches]);

  const handleSearchSubmit = useCallback(() => {
    // 자동완성 목록에서 선택된 항목이 있는 경우
    if (searchValue.trim().length > 0 && selectedIndex >= 0 && filteredItems[selectedIndex]) {
      handleItemSelect(filteredItems[selectedIndex]);
      return;
    }

    // 최근 검색어 목록에서 선택된 항목이 있는 경우
    if (searchValue.trim().length === 0 && selectedIndex >= 0 && recentSearches[selectedIndex]) {
      handleRecentSearchClick(recentSearches[selectedIndex]);
      return;
    }

    // 텍스트 입력만 있는 경우
    if (searchValue.trim()) {
      // 정확히 일치하는 아이템이 있는지 확인
      const matchingItem = itemInfos.find(
        (item) => item.name.toLowerCase() === searchValue.trim().toLowerCase()
      );

      if (matchingItem) {
        handleItemSelect(matchingItem);
      } else {
        if (isStatisticsPage) {
          toast("시세 정보에서는 목록의 아이템을 선택해주세요.");
          return;
        }
        // 일치하는 아이템이 없으면 검색어만 저장
        addRecentSearch({ itemName: searchValue.trim() });

        // 아이템 정보 페이지인 경우
        if (isItemInfoPage) {
          router.push(`/item-info?item_name=${encodeURIComponent(searchValue.trim())}`);
        } else {
          const basePath = isAuctionRealtimePage ? "/auction-realtime" : "/auction-history";
          router.push(`${basePath}?item_name=${encodeURIComponent(searchValue.trim())}`);
        }
        setIsSearchFocused(false);
        setSelectedIndex(-1);
      }
    }
  }, [
    searchValue,
    selectedIndex,
    filteredItems,
    recentSearches,
    itemInfos,
    handleItemSelect,
    handleRecentSearchClick,
    addRecentSearch,
    router,
    isAuctionRealtimePage,
    isItemInfoPage,
    isStatisticsPage,
  ]);

  // 뿔피리 검색 제출 로직
  const handleHornBugleSearchSubmit = useCallback(() => {
    const trimmed = searchValue.trim();
    if (trimmed) {
      router.push(`/horn-bugle?keyword=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/horn-bugle");
    }
    setIsSearchFocused(false);
  }, [searchValue, router]);

  // 게시판 검색 제출 로직
  const handleCommunitySearchSubmit = useCallback(() => {
    const trimmed = searchValue.trim();
    if (trimmed) {
      router.push(`/community?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/community");
    }
    setIsSearchFocused(false);
  }, [searchValue, router]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // 뿔피리 페이지: Enter 입력 시 검색
      if (isHornBuglePage) {
        if (e.key === "Enter") {
          e.preventDefault();
          handleHornBugleSearchSubmit();
        } else if (e.key === "Escape") {
          e.preventDefault();
          setIsSearchFocused(false);
        }
        return;
      }

      // 게시판 페이지: Enter 입력 시 검색
      if (isCommunityPage) {
        if (e.key === "Enter") {
          e.preventDefault();
          handleCommunitySearchSubmit();
        } else if (e.key === "Escape") {
          e.preventDefault();
          setIsSearchFocused(false);
        }
        return;
      }

      if (!isSearchablePage) return;

      if (e.key === "Enter") {
        e.preventDefault();
        handleSearchSubmit();
        return;
      }

      const items =
        searchValue.trim().length > 0 ? filteredItems : recentSearches;
      const maxIndex = items.length - 1;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (items.length > 0 && selectedIndex < maxIndex) {
          setSelectedIndex(selectedIndex + 1);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (selectedIndex > 0) {
          setSelectedIndex(selectedIndex - 1);
        } else if (selectedIndex === 0) {
          setSelectedIndex(-1);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsSearchFocused(false);
        setSelectedIndex(-1);
      }
    },
    [
      isSearchablePage,
      isHornBuglePage,
      isCommunityPage,
      searchValue,
      filteredItems,
      recentSearches,
      selectedIndex,
      handleSearchSubmit,
      handleHornBugleSearchSubmit,
      handleCommunitySearchSubmit,
    ]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value);
    },
    []
  );

  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
    refreshRecentSearches();
  }, [refreshRecentSearches]);

  const handleClearInput = useCallback(() => {
    setSearchValue("");
    searchInputRef.current?.focus();
  }, []);

  // 드롭다운 표시 여부: 검색 가능한 페이지에서만 + (입력값이 있거나 최근 검색어가 있을 때)
  const showDropdown =
    isSearchablePage &&
    isSearchFocused &&
    (searchValue.trim().length > 0 || recentSearches.length > 0);

  // URL 경로에 따른 placeholder 분기
  const searchPlaceholder = useMemo(() => {
    if (pathname.startsWith("/auction-history") || pathname.startsWith("/auction-realtime")) {
      return "아이템 검색";
    } else if (pathname.startsWith("/horn-bugle")) {
      return "캐릭터명, 메시지 검색...";
    } else if (pathname.startsWith("/community")) {
      return "게시글 제목을 검색해주세요";
    } else if (pathname.startsWith("/item-info")) {
      return "아이템 정보 검색";
    } else if (pathname.startsWith("/statistics")) {
      return "시세 아이템 검색";
    }
    return "아이템 이름을 검색하세요";
  }, [pathname]);

  // Render search input JSX (not a component to avoid remounting)
  const renderSearchInput = (className = "") => (
    <div className={clsx("relative", className)}>
      <Input
        ref={searchInputRef}
        type="text"
        placeholder={searchPlaceholder}
        className="h-10 pr-16 rounded-xl border-gray-300 dark:border-navy-500 focus:border-blaanid-500 dark:focus:border-coral-500 focus:ring-2 focus:ring-blaanid-500/20 dark:focus:ring-coral-500/20 transition-all bg-gray-50 dark:bg-navy-700 dark:text-white dark:placeholder-gray-400"
        value={searchValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleSearchFocus}
        autoComplete="off"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {searchValue && (
          <button
            onClick={handleClearInput}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-navy-600 transition-colors"
            aria-label="입력 내용 지우기"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={
            isHornBuglePage
              ? handleHornBugleSearchSubmit
              : isCommunityPage
                ? handleCommunitySearchSubmit
                : isSearchablePage
                  ? handleSearchSubmit
                  : undefined
          }
          className="p-1.5 rounded-lg text-gray-500 dark:text-gray-300 hover:text-blaanid-600 dark:hover:text-coral-400 hover:bg-gray-100 dark:hover:bg-navy-600 transition-colors"
          aria-label="검색"
          type="button"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Search Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-navy-700 rounded-xl border border-gray-200 dark:border-navy-500 shadow-[0_8px_24px_rgba(61,56,47,0.12)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)] max-h-80 overflow-y-auto z-50"
        >
          {searchValue.trim().length > 0 ? (
            // Autocomplete results
            <>
              {isLoading ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  로딩 중...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  검색 결과가 없습니다
                </div>
              ) : (
                <>
                  <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-navy-600">
                    검색 결과 {filteredItems.length}개
                  </div>
                  {filteredItems.map((item, index) => (
                    <button
                      key={`${item.topCategory}-${item.subCategory}-${item.name}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleItemSelect(item);
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={clsx(
                        "w-full text-left px-4 py-3 transition-colors border-b border-gray-100 dark:border-navy-600 last:border-b-0",
                        selectedIndex === index
                          ? "bg-blaanid-50 dark:bg-coral-500/20 text-blaanid-700 dark:text-coral-300"
                          : "text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-navy-600"
                      )}
                    >
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {item.topCategory} › {item.subCategory}
                      </div>
                    </button>
                  ))}
                </>
              )}
            </>
          ) : (
            // Recent searches
            <>
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-navy-600">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  최근 검색어
                </span>
                {recentSearches.length > 0 && (
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleClearAllRecentSearches();
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    전체삭제
                  </button>
                )}
              </div>
              {recentSearches.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  최근 검색어가 없습니다
                </div>
              ) : (
                recentSearches.map((search, index) => (
                  <button
                    key={`${search.itemName}-${index}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleRecentSearchClick(search);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={clsx(
                      "w-full text-left px-4 py-3 transition-colors border-b border-gray-100 dark:border-navy-600 last:border-b-0 flex items-start gap-3",
                      selectedIndex === index
                        ? "bg-blaanid-50 dark:bg-coral-500/20 text-blaanid-700 dark:text-coral-300"
                        : "text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-navy-600"
                    )}
                  >
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{search.itemName}</div>
                      {search.topCategory && search.subCategory && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {search.topCategory} › {search.subCategory}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  );

  // Menu navigation component (reusable)
  const MenuNavigation = () => (
    <div className="h-11">
      <div className="max-w-7xl mx-auto px-4 h-full">
        <div className="h-full overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 h-full min-w-max">
            {/* HOME Icon */}
            <Link
              href="/home"
              className={clsx(
                "relative px-3 py-2.5 transition-colors",
                pathname === "/home"
                  ? "text-blaanid-600 dark:text-coral-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              )}
              aria-label="홈"
            >
              <Home className="w-5 h-5" />
              {pathname === "/home" && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-blaanid-500 dark:bg-coral-500 rounded-full" />
              )}
            </Link>
            {navItems.map(({ href, label, ready }) => {
              const isActive =
                ready &&
                (pathname === href || pathname.startsWith(href + "/"));

              return (
              <Link
                key={label}
                href={buildSharedSearchPath(href)}
                onClick={!ready ? handleNotReady : undefined}
                className={clsx(
                    "relative px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
                    isActive
                      ? "text-blaanid-600 dark:text-coral-400"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-blaanid-500 dark:bg-coral-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-navy-800 border-b border-gray-200 dark:border-navy-600 transition-colors duration-300">
      {/* ===== DESKTOP/TABLET LAYOUT (md and above) ===== */}
      <div className="hidden md:block">
        {/* Tier 1: Logo + Search (center, flexible) + Theme Icons + Notification - Hidden on scroll */}
        <div
          className={clsx(
            "transition-all duration-300",
            isScrolled ? "h-0 opacity-0 overflow-hidden" : "h-14 opacity-100"
          )}
        >
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
            {/* Logo - Fixed width */}
            <Link
              href="/"
              className="font-bold text-xl text-gray-900 dark:text-white hover:text-blaanid-600 dark:hover:text-coral-400 transition-colors flex-shrink-0"
              style={{ fontFamily: "'Bungee', cursive" }}
            >
              MEMONOGI
            </Link>

            {/* Search - Flexible center area */}
            {renderSearchInput("flex-1 max-w-2xl mx-auto")}

            {/* Right Icons - Fixed width */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Theme Toggle Icon */}
              <button
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-navy-600 transition-colors"
                aria-label={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
                onClick={toggleTheme}
              >
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-coral-400" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-700" />
                )}
              </button>

              {/* Notification Bell - Only shown when authenticated */}
              {isAuthenticated && (
                <NotificationDropdown
                  userId={user?.userId}
                  isOpen={isNotificationOpen}
                  onClose={() => setIsNotificationOpen(false)}
                  onToggle={() => setIsNotificationOpen(!isNotificationOpen)}
                />
              )}

              {/* Login / Profile */}
              {isAuthenticated ? (
                <Link
                  href="/mypage"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-navy-600 transition-colors"
                  aria-label="마이페이지"
                >
                  {user?.profileImageUrl ? (
                    <Image
                      src={user.profileImageUrl}
                      alt="프로필"
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {user?.nickname}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blaanid-600 hover:bg-blaanid-700 dark:bg-coral-500 dark:hover:bg-coral-600 rounded-lg transition-colors"
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tier 2: Menu Navigation */}
        <MenuNavigation />
      </div>

      {/* ===== MOBILE LAYOUT (below md) ===== */}
      <div className="md:hidden">
        {/* Tier 1: Logo + Icons - Hidden on scroll */}
        <div
          className={clsx(
            "transition-all duration-300 overflow-hidden",
            isScrolled ? "h-0 opacity-0" : "h-12 opacity-100"
          )}
        >
          <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="font-bold text-xl text-gray-900 dark:text-white hover:text-blaanid-600 dark:hover:text-coral-400 transition-colors"
              style={{ fontFamily: "'Bungee', cursive" }}
            >
              MEMONOGI
            </Link>

            {/* Right Icons */}
            <div className="flex items-center gap-1">
              {/* Theme Toggle Icon */}
              <button
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-navy-600 transition-colors"
                aria-label={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
                onClick={toggleTheme}
              >
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-coral-400" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-700" />
                )}
              </button>

              {/* Notification Bell - Only shown when authenticated */}
              {isAuthenticated && (
                <NotificationDropdown
                  userId={user?.userId}
                  isOpen={isNotificationOpen}
                  onClose={() => setIsNotificationOpen(false)}
                  onToggle={() => setIsNotificationOpen(!isNotificationOpen)}
                />
              )}

              {/* Login / Profile */}
              {isAuthenticated ? (
                <Link
                  href="/mypage"
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-navy-600 transition-colors"
                  aria-label="마이페이지"
                >
                  {user?.profileImageUrl ? (
                    <Image
                      src={user.profileImageUrl}
                      alt="프로필"
                      width={20}
                      height={20}
                      className="w-5 h-5 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                  )}
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blaanid-600 hover:bg-blaanid-700 dark:bg-coral-500 dark:hover:bg-coral-600 rounded-lg transition-colors"
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tier 2: Search Bar */}
        <div className="h-12 border-b border-gray-100 dark:border-navy-600">
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
            {renderSearchInput("w-full")}
          </div>
        </div>

        {/* Tier 3: Menu Navigation */}
        <MenuNavigation />
      </div>
    </nav>
  );
}
