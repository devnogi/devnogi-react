"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { useUnifiedRecentSearches } from "@/hooks/useUnifiedRecentSearches";
import { useUnifiedSearch } from "@/hooks/useUnifiedSearch";
import { UnifiedSearchItem } from "@/types/unified-search";

import styles from "./HomeSearch.module.css";

type SearchState = {
  value: string;
  setValue: (value: string) => void;
  active: string | null;
  setActive: (id: string | null) => void;
  selected: number;
  setSelected: (index: number) => void;
  items: UnifiedSearchItem[];
  loading: boolean;
  error: boolean;
  partial: boolean;
  submit: (item?: UnifiedSearchItem) => void;
  clearRecent: () => void;
  refreshRecent: () => void;
};

const HomeSearchContext = createContext<SearchState | null>(null);

const MENU_ROUTES: Record<string, string> = {
  HOME: "/",
  COMMUNITY: "/community",
  AUCTION: "/auction-realtime",
  AUCTION_HISTORY: "/auction-history",
  AUCTION_REALTIME: "/auction-realtime",
  STATISTICS: "/statistics",
  HORN_BUGLE: "/horn-bugle",
  CODEX: "/item-info",
  ITEM_INFO: "/item-info",
  MYPAGE: "/mypage",
  SIGN_IN: "/sign-in",
};

export function HomeSearchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [selected, setSelected] = useState(-1);
  const {
    recentSearches,
    addRecentSearch,
    clearAllRecentSearches,
    refreshRecentSearches,
  } = useUnifiedRecentSearches();
  const search = useUnifiedSearch(value);
  const hasQuery = value.trim().length > 0;
  const items = hasQuery ? search.data : recentSearches;

  const submit = (chosen?: UnifiedSearchItem) => {
    if (
      hasQuery &&
      (search.isLoading || search.isDebouncing || search.isError)
    ) {
      return;
    }
    const item = chosen ?? items[0];
    if (!item) return;
    addRecentSearch(item);
    setValue(item.label);
    setActive(null);
    setSelected(-1);

    if (item.type === "USER") {
      if (item.userId) router.push(`/profile/${item.userId}`);
      return;
    }
    if (item.type === "MENU") {
      const route = MENU_ROUTES[item.targetKey];
      if (route) router.push(route);
      return;
    }
    const params = new URLSearchParams({ item_name: item.targetKey });
    router.push(`/auction-realtime?${params.toString()}`);
  };

  return (
    <HomeSearchContext.Provider
      value={{
        value,
        setValue,
        active,
        setActive,
        selected,
        setSelected,
        items,
        loading: hasQuery && (search.isLoading || search.isDebouncing),
        error: hasQuery && search.isError,
        partial: hasQuery && search.partialFailures.length > 0,
        submit,
        clearRecent: clearAllRecentSearches,
        refreshRecent: refreshRecentSearches,
      }}
    >
      {children}
    </HomeSearchContext.Provider>
  );
}

export function HomeSearch({
  location,
  className = "",
}: {
  location: "navigation" | "hero";
  className?: string;
}) {
  const state = useContext(HomeSearchContext);
  const id = useId();
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const keyboardSelection = useRef(false);
  useEffect(() => {
    if (
      state?.active === id &&
      state.selected >= 0 &&
      keyboardSelection.current
    ) {
      optionRefs.current[state.selected]?.scrollIntoView?.({
        block: "nearest",
      });
      keyboardSelection.current = false;
    }
  }, [id, state?.active, state?.selected]);
  if (!state) throw new Error("HomeSearch requires HomeSearchProvider");
  const {
    value,
    setValue,
    active,
    setActive,
    selected,
    setSelected,
    items,
    loading,
    error,
    partial,
    submit,
    clearRecent,
    refreshRecent,
  } = state;
  const open = active === id && (value.trim().length > 0 || items.length > 0);
  const hasOptions = open && !loading && !error && items.length > 0;
  const listId = `${id}-list`;
  const label = location === "hero" ? "메인 통합 검색" : "상단 통합 검색";
  return (
    <form
      className={`relative ${className}`}
      role="search"
      aria-label={label}
      onSubmit={(event) => {
        event.preventDefault();
        submit(open && selected >= 0 ? items[selected] : undefined);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setActive(null);
          setSelected(-1);
        }
      }}
    >
      {location === "hero" && (
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-foreground"
        />
      )}
      <input
        type="search"
        aria-label={label}
        role="combobox"
        aria-expanded={hasOptions}
        aria-controls={hasOptions ? listId : undefined}
        aria-activedescendant={
          hasOptions && selected >= 0 ? `${id}-option-${selected}` : undefined
        }
        aria-autocomplete="list"
        autoComplete="off"
        placeholder="유저명, 아이템명, 메뉴를 입력하세요"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setSelected(-1);
        }}
        onFocus={() => {
          setActive(id);
          setSelected(-1);
          refreshRecent();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            keyboardSelection.current = true;
            setActive(id);
            setSelected(Math.min(selected + 1, items.length - 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            keyboardSelection.current = true;
            setSelected(Math.max(selected - 1, -1));
          } else if (event.key === "Escape") {
            event.preventDefault();
            setActive(null);
            setSelected(-1);
          }
        }}
        className={`${styles.input} w-full border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${location === "hero" ? "h-[52px] rounded-lg border-border bg-[var(--color-ds-card)] pl-12 pr-24 text-sm text-[var(--color-ds-text)] placeholder:text-muted-foreground md:h-14 md:text-[15px]" : "h-10 rounded-xl border-gray-300 bg-white bg-gray-50 pl-3 pr-16 text-sm text-gray-900 placeholder:text-gray-500 dark:border-navy-500 dark:bg-navy-700 dark:text-white"}`}
      />
      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {value && (
          <button
            type="button"
            aria-label={`${label} 입력 지우기`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setValue("");
              setSelected(-1);
            }}
            className="rounded-lg p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-navy-600"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        <button
          type="submit"
          aria-label={`${label} 실행`}
          className={
            location === "hero"
              ? "min-h-11 min-w-11 rounded-lg px-3 text-sm font-semibold text-foreground hover:bg-secondary"
              : "rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-navy-600"
          }
        >
          {location === "hero" ? (
            "검색"
          ) : (
            <Search className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg dark:border-navy-500 dark:bg-navy-700">
          {!value.trim() && (
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2 text-xs text-gray-600 dark:border-navy-600 dark:text-gray-300">
              <span>최근 검색어</span>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={clearRecent}
              >
                전체삭제
              </button>
            </div>
          )}
          {loading && value.trim() ? (
            <div
              className="px-4 py-3 text-sm text-gray-600"
              role="status"
              aria-live="polite"
            >
              로딩 중...
            </div>
          ) : error ? (
            <div
              className="px-4 py-3 text-sm text-red-700"
              role="status"
              aria-live="polite"
            >
              검색 결과를 불러오지 못했습니다
            </div>
          ) : items.length === 0 ? (
            <div
              className="px-4 py-3 text-sm text-gray-600"
              role="status"
              aria-live="polite"
            >
              검색 결과가 없습니다
            </div>
          ) : (
            <ul
              id={listId}
              role="listbox"
              aria-label={value.trim() ? "통합 검색 자동완성" : "최근 검색어"}
            >
              {items.map((item, index) => (
                <li
                  id={`${id}-option-${index}`}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  key={`${item.type}-${item.targetKey}`}
                  role="option"
                  aria-selected={selected === index}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => submit(item)}
                  onMouseEnter={() => {
                    keyboardSelection.current = false;
                    setSelected(index);
                  }}
                  className={`cursor-pointer px-4 py-3 text-sm text-gray-900 dark:text-gray-100 ${selected === index ? "bg-[var(--color-ds-primary-50)]" : "hover:bg-gray-50 dark:hover:bg-navy-600"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span>{item.label}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-300">
                      {item.type === "ITEM"
                        ? "아이템"
                        : item.type === "MENU"
                          ? "메뉴"
                          : "사용자"}
                    </span>
                  </div>
                  {item.type === "USER" && item.serverName && (
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                      {item.serverName} 서버
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          {partial && !loading && !error && (
            <div
              className="border-t border-gray-100 px-4 py-2 text-xs text-amber-700 dark:border-navy-600 dark:text-amber-300"
              role="status"
              aria-live="polite"
            >
              일부 검색 결과를 불러오지 못했습니다.
            </div>
          )}
        </div>
      )}
    </form>
  );
}
