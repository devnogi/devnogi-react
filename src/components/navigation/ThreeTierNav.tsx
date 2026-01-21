"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import clsx from "clsx";
import { Bell, Search, Sun, Moon, User, Home } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useItemInfos, ItemInfo } from "@/hooks/useItemInfos";
import { useAuth } from "@/contexts/AuthContext";

// Navigation menu items
const navItems = [
  { href: "/auction-history", label: "경매장 거래내역", ready: true },
  { href: "#", label: "경매장 실시간 정보", ready: false },
  { href: "#", label: "시세 정보", ready: false },
  { href: "#", label: "거대한 뿔피리", ready: false },
  { href: "#", label: "정보 게시판", ready: false },
  { href: "/community", label: "게시판", ready: true },
];

// Recent searches management
const RECENT_SEARCHES_KEY = "auction_recent_searches";
const MAX_RECENT_SEARCHES = 10;

interface RecentSearch {
  itemName: string;
  topCategory?: string;
  subCategory?: string;
}

const getRecentSearches = (): RecentSearch[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length > 0) {
      if (typeof parsed[0] === "string") {
        return parsed.map((s) => ({ itemName: s }));
      }
      return parsed as RecentSearch[];
    }
    return [];
  } catch {
    return [];
  }
};

const addRecentSearch = (search: RecentSearch) => {
  if (!search.itemName.trim()) return;
  const searches = getRecentSearches();
  const filtered = searches.filter((s) => s.itemName !== search.itemName);
  const updated = [search, ...filtered].slice(0, MAX_RECENT_SEARCHES);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
};

const clearRecentSearches = () => {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
};

export default function ThreeTierNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasUnreadNotification] = useState(true); // Mock for now
  const [isDarkMode, setIsDarkMode] = useState(false); // UI only toggle

  // Search states
  const [searchValue, setSearchValue] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Item data for autocomplete
  const { data: itemInfos = [], isLoading } = useItemInfos();

  // Filtered items based on search input
  const filteredItems = useMemo(() => {
    if (!searchValue || searchValue.trim().length === 0) {
      return [];
    }
    const searchTerm = searchValue.toLowerCase().trim();
    return itemInfos
      .filter((item) => item.name.toLowerCase().includes(searchTerm))
      .slice(0, 10);
  }, [itemInfos, searchValue]);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

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
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotReady = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    toast("죄송합니다. 해당 메뉴는 오픈 준비 중입니다", {
      description: "빠른 시일 내에 준비하겠습니다!",
    });
  };

  const handleItemSelect = (item: ItemInfo) => {
    setSearchValue(item.name);
    addRecentSearch({
      itemName: item.name,
      topCategory: item.topCategory,
      subCategory: item.subCategory,
    });
    setRecentSearches(getRecentSearches());
    setIsSearchFocused(false);
    setSelectedIndex(-1);

    // Navigate to auction history with search params
    const categoryId = `${item.topCategory}/${item.subCategory}`;
    router.push(
      `/auction-history?itemName=${encodeURIComponent(item.name)}&category=${encodeURIComponent(categoryId)}`
    );
  };

  const handleRecentSearchClick = (search: RecentSearch) => {
    setSearchValue(search.itemName);
    addRecentSearch(search);
    setRecentSearches(getRecentSearches());
    setIsSearchFocused(false);

    const categoryId =
      search.topCategory && search.subCategory
        ? `${search.topCategory}/${search.subCategory}`
        : undefined;

    if (categoryId) {
      router.push(
        `/auction-history?itemName=${encodeURIComponent(search.itemName)}&category=${encodeURIComponent(categoryId)}`
      );
    } else {
      router.push(
        `/auction-history?itemName=${encodeURIComponent(search.itemName)}`
      );
    }
  };

  const handleClearAllRecentSearches = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const handleSearchSubmit = () => {
    if (selectedIndex >= 0 && filteredItems[selectedIndex]) {
      handleItemSelect(filteredItems[selectedIndex]);
    } else if (searchValue.trim()) {
      // 입력한 검색어와 정확히 일치하는 아이템이 있는지 확인
      const matchingItem = itemInfos.find(
        (item) => item.name.toLowerCase() === searchValue.trim().toLowerCase()
      );

      if (matchingItem) {
        // 정확히 일치하는 아이템이 있으면 카테고리 정보 포함
        addRecentSearch({
          itemName: matchingItem.name,
          topCategory: matchingItem.topCategory,
          subCategory: matchingItem.subCategory,
        });
        setRecentSearches(getRecentSearches());
        const categoryId = `${matchingItem.topCategory}/${matchingItem.subCategory}`;
        router.push(
          `/auction-history?itemName=${encodeURIComponent(matchingItem.name)}&category=${encodeURIComponent(categoryId)}`
        );
      } else {
        // 일치하는 아이템이 없으면 검색어만 저장
        addRecentSearch({ itemName: searchValue.trim() });
        setRecentSearches(getRecentSearches());
        router.push(
          `/auction-history?itemName=${encodeURIComponent(searchValue.trim())}`
        );
      }
      setIsSearchFocused(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      if (selectedIndex < maxIndex) {
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
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setSelectedIndex(-1);
  };

  const showDropdown =
    isSearchFocused &&
    (searchValue.trim().length > 0 ||
      (searchValue.trim().length === 0 && recentSearches.length > 0));

  // URL 경로에 따른 placeholder 분기
  const searchPlaceholder = useMemo(() => {
    if (pathname.startsWith("/auction-history")) {
      return "아이템 검색";
    } else if (pathname.startsWith("/community")) {
      return "게시글 제목을 검색해주세요";
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
        className="h-10 pr-10 rounded-xl border-gray-300 focus:border-blaanid-500 focus:ring-2 focus:ring-blaanid-500/20 transition-all bg-gray-50"
        value={searchValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setIsSearchFocused(true);
          setRecentSearches(getRecentSearches());
        }}
        autoComplete="off"
      />
      <button
        onClick={handleSearchSubmit}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-500 hover:text-blaanid-600 hover:bg-gray-100 transition-colors"
        aria-label="검색"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Search Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-[0_8px_24px_rgba(61,56,47,0.10)] max-h-80 overflow-y-auto z-50"
        >
          {searchValue.trim().length > 0 ? (
            // Autocomplete results
            <>
              {isLoading ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  로딩 중...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  검색 결과가 없습니다
                </div>
              ) : (
                <>
                  <div className="px-4 py-2 text-xs text-gray-500">
                    {filteredItems.length}개의 아이템
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
                        "w-full text-left px-4 py-3 transition-colors border-b border-gray-100 last:border-b-0",
                        selectedIndex === index
                          ? "bg-blaanid-50 text-blaanid-700"
                          : "text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
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
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-xs text-gray-500">최근 검색어</span>
                <button
                  onClick={handleClearAllRecentSearches}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  전체삭제
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={`${search.itemName}-${index}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleRecentSearchClick(search);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={clsx(
                    "w-full text-left px-4 py-3 transition-colors border-b border-gray-100 last:border-b-0",
                    selectedIndex === index
                      ? "bg-blaanid-50 text-blaanid-700"
                      : "text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <div className="font-medium text-sm">{search.itemName}</div>
                  {search.topCategory && search.subCategory && (
                    <div className="text-xs text-gray-500 mt-1">
                      {search.topCategory} › {search.subCategory}
                    </div>
                  )}
                </button>
              ))}
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
              href="#"
              onClick={handleNotReady}
              className="relative px-3 py-2.5 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="홈"
            >
              <Home className="w-5 h-5" />
            </Link>
            {navItems.map(({ href, label, ready }) => {
              const isActive =
                ready &&
                (pathname === href || pathname.startsWith(href + "/"));

              return (
                <Link
                  key={label}
                  href={href}
                  onClick={!ready ? handleNotReady : undefined}
                  className={clsx(
                    "relative px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
                    isActive
                      ? "text-blaanid-600"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-blaanid-500 rounded-full" />
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      {/* ===== DESKTOP/TABLET LAYOUT (md and above) ===== */}
      <div className="hidden md:block">
        {/* Tier 1: Logo + Search (center, flexible) + Theme Icons + Notification - Hidden on scroll */}
        <div
          className={clsx(
            "transition-all duration-300 overflow-hidden",
            isScrolled ? "h-0 opacity-0" : "h-14 opacity-100"
          )}
        >
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
            {/* Logo - Fixed width */}
            <Link
              href="/"
              className="font-bold text-xl text-gray-900 hover:text-blaanid-600 transition-colors flex-shrink-0"
              style={{ fontFamily: "'Bungee', cursive" }}
            >
              MEMNOGI
            </Link>

            {/* Search - Flexible center area */}
            {renderSearchInput("flex-1 max-w-2xl mx-auto")}

            {/* Right Icons - Fixed width */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Theme Toggle Icon (UI only) */}
              <button
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-gray-700" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-700" />
                )}
              </button>

              {/* Notification Bell - Only shown when authenticated */}
              {isAuthenticated && (
                <button
                  className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  aria-label="알림"
                >
                  <Bell className="w-5 h-5 text-gray-700" />
                  {hasUnreadNotification && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold-500 rounded-full" />
                  )}
                </button>
              )}

              {/* Login / Profile */}
              {isAuthenticated ? (
                <Link
                  href="/profile"
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  aria-label="프로필"
                >
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="프로필"
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-700" />
                  )}
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blaanid-600 hover:bg-blaanid-700 rounded-lg transition-colors"
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
              className="font-bold text-xl text-gray-900 hover:text-blaanid-600 transition-colors"
              style={{ fontFamily: "'Bungee', cursive" }}
            >
              MEMNOGI
            </Link>

            {/* Right Icons */}
            <div className="flex items-center gap-1">
              {/* Theme Toggle Icon (UI only) */}
              <button
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-gray-700" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-700" />
                )}
              </button>

              {/* Notification Bell - Only shown when authenticated */}
              {isAuthenticated && (
                <button
                  className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  aria-label="알림"
                >
                  <Bell className="w-5 h-5 text-gray-700" />
                  {hasUnreadNotification && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold-500 rounded-full" />
                  )}
                </button>
              )}

              {/* Login / Profile */}
              {isAuthenticated ? (
                <Link
                  href="/profile"
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  aria-label="프로필"
                >
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="프로필"
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-700" />
                  )}
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blaanid-600 hover:bg-blaanid-700 rounded-lg transition-colors"
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tier 2: Search Bar */}
        <div className="h-12 border-b border-gray-100">
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
