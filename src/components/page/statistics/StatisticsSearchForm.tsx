"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Search, Clock, X } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { StatisticsTabType } from "./StatisticsTabs";
import { useItemCategories } from "@/hooks/useItemCategories";
import { useItemInfos, ItemInfo } from "@/hooks/useItemInfos";
import { useRecentSearches, RecentSearch } from "@/hooks/useRecentSearches";

interface StatisticsSearchFormProps {
  activeTab: StatisticsTabType;
  topCategory: string;
  subCategory: string;
  itemName: string;
  onTopCategoryChange: (value: string) => void;
  onSubCategoryChange: (value: string) => void;
  onItemNameChange: (value: string) => void;
  onSearch: (params: {
    topCategory: string;
    subCategory: string;
    itemName: string;
  }) => void;
}

export default function StatisticsSearchForm({
  activeTab,
  topCategory,
  subCategory,
  itemName,
  onTopCategoryChange,
  onSubCategoryChange,
  onItemNameChange,
  onSearch,
}: StatisticsSearchFormProps) {
  const { data: categories = [] } = useItemCategories();
  const { data: itemInfos = [], isLoading: isItemLoading } = useItemInfos();
  const {
    recentSearches,
    addRecentSearch,
    clearAllRecentSearches,
    refreshRecentSearches,
  } = useRecentSearches();
  const [isItemInputFocused, setIsItemInputFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const topCategories = useMemo(() => {
    const topNodes =
      categories.find((category) => category.id === "all" && category.children?.length)?.children ||
      categories.filter((category) => category.id !== "all");
    return topNodes.map((category) => category.name);
  }, [categories]);

  const subCategories = useMemo(() => {
    const topNodes =
      categories.find((category) => category.id === "all" && category.children?.length)?.children ||
      categories.filter((category) => category.id !== "all");

    const selectedTop = topNodes.find((category) => category.name === topCategory);
    return selectedTop?.children?.map((child) => child.name) ?? [];
  }, [categories, topCategory]);

  const filteredItems = useMemo(() => {
    if (activeTab !== "item") {
      return [];
    }
    if (!itemName.trim()) {
      return [];
    }
    const term = itemName.toLowerCase().trim();
    return itemInfos
      .filter((item) => item.name.toLowerCase().includes(term))
      .slice(0, 10);
  }, [activeTab, itemName, itemInfos]);

  const showDropdown =
    activeTab === "item" &&
    isItemInputFocused &&
    (itemName.trim().length > 0 || recentSearches.length > 0);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [itemName]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        inputRef.current &&
        !inputRef.current.contains(target)
      ) {
        setIsItemInputFocused(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const submitSearch = useCallback(
    (nextTop: string, nextSub: string, nextItemName: string) => {
      onSearch({
        topCategory: nextTop,
        subCategory: nextSub,
        itemName: nextItemName,
      });
    },
    [onSearch],
  );

  const handleItemSelect = useCallback(
    (item: ItemInfo) => {
      onItemNameChange(item.name);
      onTopCategoryChange(item.topCategory);
      onSubCategoryChange(item.subCategory);
      addRecentSearch({
        itemName: item.name,
        topCategory: item.topCategory,
        subCategory: item.subCategory,
      });
      setIsItemInputFocused(false);
      setSelectedIndex(-1);
      submitSearch(item.topCategory, item.subCategory, item.name);
    },
    [
      addRecentSearch,
      onItemNameChange,
      onTopCategoryChange,
      onSubCategoryChange,
      submitSearch,
    ],
  );

  const handleRecentSearchClick = useCallback(
    (search: RecentSearch) => {
      if (!search.topCategory || !search.subCategory) {
        toast("카테고리 정보가 없는 최근 검색어입니다.");
        return;
      }
      onItemNameChange(search.itemName);
      onTopCategoryChange(search.topCategory);
      onSubCategoryChange(search.subCategory);
      addRecentSearch(search);
      setIsItemInputFocused(false);
      setSelectedIndex(-1);
      submitSearch(search.topCategory, search.subCategory, search.itemName);
    },
    [
      addRecentSearch,
      onItemNameChange,
      onTopCategoryChange,
      onSubCategoryChange,
      submitSearch,
    ],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab !== "item") {
      submitSearch(topCategory, subCategory, itemName);
      return;
    }

    if (itemName.trim().length > 0 && selectedIndex >= 0 && filteredItems[selectedIndex]) {
      handleItemSelect(filteredItems[selectedIndex]);
      return;
    }

    if (itemName.trim().length === 0 && selectedIndex >= 0 && recentSearches[selectedIndex]) {
      handleRecentSearchClick(recentSearches[selectedIndex]);
      return;
    }

    const exactItem = itemInfos.find(
      (item) => item.name.toLowerCase() === itemName.trim().toLowerCase(),
    );
    if (!exactItem) {
      toast("목록의 아이템을 선택해주세요.");
      return;
    }
    handleItemSelect(exactItem);
  };

  const handleTopCategorySelect = (value: string) => {
    onTopCategoryChange(value);
    onSubCategoryChange("");
    if (activeTab === "item") {
      onItemNameChange("");
    }
  };

  const handleSubCategorySelect = (value: string) => {
    onSubCategoryChange(value);
    if (activeTab === "item") {
      onItemNameChange("");
    }
  };

  const isSearchDisabled = () => {
    if (activeTab === "top-category") return !topCategory;
    if (activeTab === "subcategory") return !topCategory || !subCategory;
    return !topCategory || !subCategory || !itemName.trim();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-3 lg:flex-row lg:items-end">
        {/* Top Category */}
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            탑 카테고리
          </label>
          <select
            value={topCategory}
            onChange={(e) => handleTopCategorySelect(e.target.value)}
            className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blaanid-500/20 dark:focus:ring-coral-500/20"
          >
            <option value="">선택하세요</option>
            {topCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sub Category - only for item and subcategory tabs */}
        {activeTab !== "top-category" && (
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              서브 카테고리
            </label>
            <select
              value={subCategory}
              onChange={(e) => handleSubCategorySelect(e.target.value)}
              disabled={!topCategory}
              className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blaanid-500/20 dark:focus:ring-coral-500/20 disabled:opacity-50"
            >
              <option value="">선택하세요</option>
              {subCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Item Name - only for item tab */}
        {activeTab === "item" && (
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              아이템명
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={itemName}
                onChange={(e) => onItemNameChange(e.target.value)}
                onFocus={() => {
                  setIsItemInputFocused(true);
                  refreshRecentSearches();
                }}
                onKeyDown={(e) => {
                  const items = itemName.trim().length > 0 ? filteredItems : recentSearches;
                  const maxIndex = items.length - 1;

                  if (e.key === "Enter") {
                    return;
                  }

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
                    setIsItemInputFocused(false);
                    setSelectedIndex(-1);
                  }
                }}
                placeholder="아이템명을 입력하세요"
                className="w-full h-10 px-3 pr-10 text-sm rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blaanid-500/20 dark:focus:ring-coral-500/20"
              />
              {itemName && (
                <button
                  type="button"
                  onClick={() => {
                    onItemNameChange("");
                    inputRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label="입력 내용 지우기"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {showDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-navy-700 rounded-xl border border-gray-200 dark:border-navy-500 shadow-[0_8px_24px_rgba(61,56,47,0.12)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)] max-h-80 overflow-y-auto z-50"
                >
                  {itemName.trim().length > 0 ? (
                    <>
                      {isItemLoading ? (
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
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleItemSelect(item);
                              }}
                              onMouseEnter={() => setSelectedIndex(index)}
                              className={clsx(
                                "w-full text-left px-4 py-3 transition-colors border-b border-gray-100 dark:border-navy-600 last:border-b-0",
                                selectedIndex === index
                                  ? "bg-blaanid-50 dark:bg-coral-500/20 text-blaanid-700 dark:text-coral-300"
                                  : "text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-navy-600",
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
                    <>
                      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-navy-600">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          최근 검색어
                        </span>
                        {recentSearches.length > 0 && (
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              clearAllRecentSearches();
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
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleRecentSearchClick(search);
                            }}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={clsx(
                              "w-full text-left px-4 py-3 transition-colors border-b border-gray-100 dark:border-navy-600 last:border-b-0 flex items-start gap-3",
                              selectedIndex === index
                                ? "bg-blaanid-50 dark:bg-coral-500/20 text-blaanid-700 dark:text-coral-300"
                                : "text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-navy-600",
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
          </div>
        )}

        {/* Search Button */}
        <button
          type="submit"
          disabled={isSearchDisabled()}
          className="h-10 px-6 text-sm font-medium text-white bg-blaanid-500 dark:bg-coral-500 hover:bg-blaanid-600 dark:hover:bg-coral-600 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Search className="w-4 h-4" />
          조회
        </button>
      </div>
    </form>
  );
}
