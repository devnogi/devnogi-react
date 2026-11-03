"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { useItemInfos } from "@/hooks/useItemInfos";
import { RecentSearch, useRecentSearches } from "@/hooks/useRecentSearches";

import styles from "./HomeSearch.module.css";

type SearchState = {
  value: string;
  setValue: (value: string) => void;
  active: string | null;
  setActive: (id: string | null) => void;
  selected: number;
  setSelected: (index: number) => void;
  items: RecentSearch[];
  loading: boolean;
  submit: (item?: RecentSearch) => void;
  clearRecent: () => void;
  refreshRecent: () => void;
};

const HomeSearchContext = createContext<SearchState | null>(null);

export function HomeSearchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [selected, setSelected] = useState(-1);
  const { data = [], isLoading } = useItemInfos();
  const {
    recentSearches,
    addRecentSearch,
    clearAllRecentSearches,
    refreshRecentSearches,
  } = useRecentSearches();
  const items = useMemo(() => {
    const term = value.trim().toLowerCase();
    if (!term) return recentSearches;
    return data
      .filter((item) => item.name.toLowerCase().includes(term))
      .slice(0, 10)
      .map((item) => ({
        itemName: item.name,
        topCategory: item.topCategory,
        subCategory: item.subCategory,
      }));
  }, [data, recentSearches, value]);

  const submit = (chosen?: RecentSearch) => {
    const term = value.trim();
    const exact = data.find(
      (item) => item.name.toLowerCase() === term.toLowerCase(),
    );
    const search =
      chosen ??
      (exact
        ? {
            itemName: exact.name,
            topCategory: exact.topCategory,
            subCategory: exact.subCategory,
          }
        : { itemName: term });
    if (!search.itemName.trim()) return;
    addRecentSearch(search);
    setValue(search.itemName);
    setActive(null);
    setSelected(-1);
    const params = new URLSearchParams({ item_name: search.itemName });
    if (search.topCategory) params.set("top_category", search.topCategory);
    if (search.subCategory) params.set("sub_category", search.subCategory);
    router.push(`/auction-history?${params.toString()}`);
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
        loading: isLoading,
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
    submit,
    clearRecent,
    refreshRecent,
  } = state;
  const open = active === id && (value.trim().length > 0 || items.length > 0);
  const listId = `${id}-list`;
  const label = location === "hero" ? "메인 아이템 검색" : "상단 아이템 검색";
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
      <input
        type="search"
        aria-label={label}
        role="combobox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={
          open && selected >= 0 ? `${id}-option-${selected}` : undefined
        }
        aria-autocomplete="list"
        autoComplete="off"
        placeholder={
          location === "hero" ? "아이템 이름을 검색하세요" : "아이템 검색"
        }
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
        className={`${styles.input} w-full rounded-xl border bg-white text-gray-900 placeholder:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a63f20] dark:border-navy-500 dark:bg-navy-700 dark:text-white ${location === "hero" ? "h-14 border-[#c85f40] pl-5 pr-28 text-base shadow-sm" : "h-10 border-gray-300 bg-gray-50 pl-3 pr-16 text-sm"}`}
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
              ? "rounded-lg bg-[#b84c2d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#973c23]"
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
          <ul
            id={listId}
            role="listbox"
            aria-label={value.trim() ? "아이템 자동완성" : "최근 검색어"}
          >
            {loading && value.trim() ? (
              <li className="px-4 py-3 text-sm text-gray-600">로딩 중...</li>
            ) : items.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-600">
                검색 결과가 없습니다
              </li>
            ) : (
              items.map((item, index) => (
                <li
                  id={`${id}-option-${index}`}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  key={`${item.itemName}-${index}`}
                  role="option"
                  aria-selected={selected === index}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => submit(item)}
                  onMouseEnter={() => {
                    keyboardSelection.current = false;
                    setSelected(index);
                  }}
                  className={`cursor-pointer px-4 py-3 text-sm text-gray-900 dark:text-gray-100 ${selected === index ? "bg-orange-50 dark:bg-navy-600" : "hover:bg-gray-50 dark:hover:bg-navy-600"}`}
                >
                  <div>{item.itemName}</div>
                  {item.topCategory && item.subCategory && (
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                      {item.topCategory} › {item.subCategory}
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </form>
  );
}
