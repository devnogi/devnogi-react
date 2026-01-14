"use client";

import SearchSection from "@/components/commons/Search";
import AuctionHistoryList from "@/components/page/auction-history/AuctionHistoryList";
import CategorySection from "@/components/commons/Category";
import CategoryModal from "@/components/commons/CategoryModal";
import SearchFilterCard from "@/components/page/auction-history/SearchFilterCard";
import MobileFilterChips from "@/components/page/auction-history/MobileFilterChips";
import MobileFilterModal from "@/components/page/auction-history/MobileFilterModal";
import MobileSearchModal from "@/components/page/auction-history/MobileSearchModal";
import { useItemCategories } from "@/hooks/useItemCategories";
import { ItemCategory } from "@/data/item-category";
import { useInfiniteAuctionHistory } from "@/hooks/useInfiniteAuctionHistory";
import { AuctionHistorySearchParams } from "@/types/auction-history";
import { ActiveFilter } from "@/types/search-filter";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";

export default function Page() {
  const [itemName, setItemName] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchParams, setSearchParams] = useState<AuctionHistorySearchParams>(
    {},
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isMobileSearchModalOpen, setIsMobileSearchModalOpen] = useState(false);
  const [isViewTypeDropdownOpen, setIsViewTypeDropdownOpen] = useState(false);
  const [viewType, setViewType] = useState<"거래 내역" | "실시간 경매장" | "경매장 통계">("거래 내역");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [sortOption, setSortOption] = useState<{
    label: string;
    sortBy: string;
    direction: "asc" | "desc";
  }>({ label: "거래 최신순", sortBy: "dateAuctionBuy", direction: "desc" });

  // Mobile filter states
  const [mobileFilterType, setMobileFilterType] = useState<
    "category" | "price" | "date" | "options" | null
  >(null);
  const [mobilePriceMin, setMobilePriceMin] = useState("");
  const [mobilePriceMax, setMobilePriceMax] = useState("");
  const [mobileDateFrom, setMobileDateFrom] = useState("");
  const [mobileDateTo, setMobileDateTo] = useState("");
  const [mobileActiveFilters, setMobileActiveFilters] = useState<ActiveFilter[]>([]);

  const { data: categories = [], isLoading: isCategoriesLoading } =
    useItemCategories();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteAuctionHistory(searchParams);

  // Flatten all pages into a single array
  const allItems = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const totalElements = data?.pages[0]?.meta.totalElements ?? 0;

  const findCategoryPath = useCallback(
    (
      categories: ItemCategory[],
      targetId: string,
      currentPath: ItemCategory[] = [],
    ): ItemCategory[] => {
      for (const category of categories) {
        const newPath = [...currentPath, category];
        if (category.id === targetId) {
          return newPath;
        }
        if (category.children) {
          const foundPath = findCategoryPath(
            category.children,
            targetId,
            newPath,
          );
          if (foundPath.length > 0) {
            return foundPath;
          }
        }
      }
      return [];
    },
    [],
  );

  const categoryPath = useMemo(
    () => findCategoryPath(categories, selectedCategory),
    [selectedCategory, categories, findCategoryPath],
  );

  useEffect(() => {
    const idsToExpand = categoryPath.slice(0, -1).map((c) => c.id);

    setExpandedIds((prev) => {
      // Check if all IDs are already in the set
      const allAlreadyExpanded = idsToExpand.every((id) => prev.has(id));
      if (allAlreadyExpanded && prev.size === idsToExpand.length) {
        return prev; // Return same reference to prevent re-render
      }

      // Only create new Set if there are changes
      return new Set(idsToExpand);
    });
  }, [categoryPath]);

  useEffect(() => {
    setIsClientMounted(true);
    const saved = localStorage.getItem("lastSelectedCategoryTradeLog");
    if (saved) {
      setSelectedCategory(saved);
    }
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (isClientMounted) {
      localStorage.setItem("lastSelectedCategoryTradeLog", categoryId);
    }
  };

  const handleToggleExpand = (categoryId: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleSearch = (overrides?: { itemName?: string; categoryId?: string }) => {
    const params: AuctionHistorySearchParams = {};

    // Add item name if provided
    const searchItemName = overrides?.itemName ?? itemName;
    if (searchItemName.trim()) {
      params.itemName = searchItemName.trim();
    }

    // Add category filters if not "all"
    const categoryToUse = overrides?.categoryId ?? selectedCategory;
    if (categoryToUse !== "all") {
      const parts = categoryToUse.split("/");
      if (parts.length === 1) {
        // Top category only
        params.itemTopCategory = parts[0];
      } else if (parts.length === 2) {
        // Both top and sub category
        params.itemTopCategory = parts[0];
        params.itemSubCategory = parts[1];
      }
    }

    setSearchParams(params);
  };

  const handleFilterApply = (filters: AuctionHistorySearchParams) => {
    // Merge existing search params with new filters
    const params: AuctionHistorySearchParams = {
      ...searchParams,
      ...filters,
    };

    setSearchParams(params);
  };

  const handleMobileFilterApply = (data: {
    selectedCategory?: string;
    priceMin?: string;
    priceMax?: string;
    dateFrom?: string;
    dateTo?: string;
    activeFilters?: ActiveFilter[];
  }) => {
    // Update mobile filter states
    if (data.selectedCategory !== undefined) {
      setSelectedCategory(data.selectedCategory);
      if (isClientMounted) {
        localStorage.setItem("lastSelectedCategoryTradeLog", data.selectedCategory);
      }
    }
    if (data.priceMin !== undefined) setMobilePriceMin(data.priceMin);
    if (data.priceMax !== undefined) setMobilePriceMax(data.priceMax);
    if (data.dateFrom !== undefined) setMobileDateFrom(data.dateFrom);
    if (data.dateTo !== undefined) setMobileDateTo(data.dateTo);
    if (data.activeFilters !== undefined)
      setMobileActiveFilters(data.activeFilters);

    // Build search params
    const params: AuctionHistorySearchParams = { ...searchParams };

    // Category
    if (data.selectedCategory !== undefined) {
      const category = data.selectedCategory;
      if (category !== "all") {
        const parts = category.split("/");
        if (parts.length === 1) {
          params.itemTopCategory = parts[0];
          delete params.itemSubCategory;
        } else if (parts.length === 2) {
          params.itemTopCategory = parts[0];
          params.itemSubCategory = parts[1];
        }
      } else {
        delete params.itemTopCategory;
        delete params.itemSubCategory;
      }
    }

    // Price
    if (data.priceMin || data.priceMax || mobilePriceMin || mobilePriceMax) {
      params.priceSearchRequest = {};
      const minPrice = data.priceMin !== undefined ? data.priceMin : mobilePriceMin;
      const maxPrice = data.priceMax !== undefined ? data.priceMax : mobilePriceMax;
      if (minPrice) params.priceSearchRequest.priceFrom = Number(minPrice);
      if (maxPrice) params.priceSearchRequest.priceTo = Number(maxPrice);
    }

    // Date
    if (data.dateFrom || data.dateTo || mobileDateFrom || mobileDateTo) {
      params.dateAuctionBuyRequest = {};
      const from = data.dateFrom !== undefined ? data.dateFrom : mobileDateFrom;
      const to = data.dateTo !== undefined ? data.dateTo : mobileDateTo;
      if (from) params.dateAuctionBuyRequest.dateAuctionBuyFrom = from;
      if (to) params.dateAuctionBuyRequest.dateAuctionBuyTo = to;
    }

    // Options
    const filters =
      data.activeFilters !== undefined
        ? data.activeFilters
        : mobileActiveFilters;
    if (filters.length > 0) {
      params.itemOptionSearchRequest = {};

      filters.forEach((filter) => {
        Object.entries(filter.values).forEach(([key, value]) => {
          if (value === undefined || value === "") return;

          let optionSearchKey: string;
          if (key.endsWith("From") || key.endsWith("To")) {
            const baseName = key.replace(/(From|To)$/, "");
            optionSearchKey = `${baseName}Search`;
          } else if (key.endsWith("Standard")) {
            const baseName = key.replace(/Standard$/, "");
            optionSearchKey = `${baseName}Search`;
          } else if (key === "wearingRestrictions") {
            optionSearchKey = "wearingRestrictionsSearch";
          } else if (key === "ergRank") {
            optionSearchKey = "ergRankSearch";
          } else {
            optionSearchKey = `${key}Search`;
          }

          if (
            !params.itemOptionSearchRequest![
              optionSearchKey as keyof typeof params.itemOptionSearchRequest
            ]
          ) {
            (
              params.itemOptionSearchRequest as Record<
                string,
                Record<string, unknown>
              >
            )[optionSearchKey] = {};
          }

          (
            params.itemOptionSearchRequest as Record<
              string,
              Record<string, unknown>
            >
          )[optionSearchKey][key] = value;
        });
      });
    }

    setSearchParams(params);
  };

  if (isCategoriesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="select-none absolute inset-0 bg-white">
      {/* Fixed Floating Category Sidebar - Only visible on 2xl+ screens (1536px+) */}
      <div className="fixed left-4 top-24 bottom-8 w-56 z-40 hidden 2xl:block">
        <CategorySection
          selectedId={selectedCategory}
          onSelect={handleCategorySelect}
          expandedIds={expandedIds}
          onToggleExpand={handleToggleExpand}
          categories={categories}
        />
      </div>

      {/* Category Modal - Visible on lg and below */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        selectedId={selectedCategory}
        onSelect={handleCategorySelect}
        expandedIds={expandedIds}
        onToggleExpand={handleToggleExpand}
        categories={categories}
      />

      {/* Centered Main Content Container */}
      <div className="h-full overflow-auto flex justify-center [scrollbar-gutter:stable]">
        <div className="w-full max-w-4xl px-4 md:px-6 py-4 md:py-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-[1.35rem] md:text-[1.7rem] font-bold text-gray-900">
                  경매장 {viewType}
                </h1>
                <div className="relative">
                  <button
                    onClick={() => setIsViewTypeDropdownOpen(!isViewTypeDropdownOpen)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="보기 유형 선택"
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isViewTypeDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg py-2 z-50 min-w-[160px]">
                      {["거래 내역", "실시간 경매장", "경매장 통계"].map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setViewType(type as typeof viewType);
                            setIsViewTypeDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                            viewType === type
                              ? "bg-blue-50 text-blue-600 font-semibold"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Search Button - Only visible on lg and below */}
              <button
                onClick={() => setIsMobileSearchModalOpen(true)}
                className="lg:hidden flex items-center justify-center w-10 h-10 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="아이템 검색"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Filter Chips - Only visible on lg and below */}
          <div className="mb-4 lg:hidden">
            <MobileFilterChips
              activeFilters={{
                hasCategory: selectedCategory !== "all",
                hasPrice: !!(mobilePriceMin || mobilePriceMax),
                hasDate: !!(mobileDateFrom || mobileDateTo),
                hasOptions: mobileActiveFilters.length > 0,
              }}
              onCategoryClick={() => setMobileFilterType("category")}
              onPriceClick={() => setMobileFilterType("price")}
              onDateClick={() => setMobileFilterType("date")}
              onOptionsClick={() => setMobileFilterType("options")}
            />
          </div>

          {/* Search Section - Only visible on lg+ screens */}
          <div className="mb-6 hidden lg:block">
            <SearchSection
              path={categoryPath}
              onCategorySelect={handleCategorySelect}
              itemName={itemName}
              setItemName={setItemName}
              onSearch={handleSearch}
              onCategoryMenuClick={() => setIsCategoryModalOpen(true)}
            />
          </div>

          {/* Results Section */}
          <div>
            {totalElements > 0 && (
              <div className="mb-4 flex items-center justify-between">
                <div className="text-xs md:text-sm text-gray-600">
                  {itemName ? (
                    <>
                      <span className="font-semibold text-blue-600">{itemName}</span> 검색결과{" "}
                      <span className="font-semibold">{totalElements}</span>개
                    </>
                  ) : (
                    <>
                      검색결과 <span className="font-semibold">{totalElements}</span>개
                    </>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs md:text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="font-medium">{sortOption.label}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isSortDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg py-2 z-50 min-w-[180px]">
                      {[
                        { label: "거래 최신순", sortBy: "dateAuctionBuy", direction: "desc" as const },
                        { label: "거래 오래된순", sortBy: "dateAuctionBuy", direction: "asc" as const },
                        { label: "개당 가격 낮은순", sortBy: "auctionPricePerUnit", direction: "asc" as const },
                        { label: "개당 가격 높은순", sortBy: "auctionPricePerUnit", direction: "desc" as const },
                      ].map((option) => (
                        <button
                          key={option.label}
                          onClick={() => {
                            setSortOption(option);
                            setIsSortDropdownOpen(false);
                            setSearchParams({
                              ...searchParams,
                              sortBy: option.sortBy,
                              direction: option.direction,
                            });
                          }}
                          className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                            sortOption.label === option.label
                              ? "bg-blue-50 text-blue-600 font-semibold"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <AuctionHistoryList items={allItems} isLoading={isLoading} />

            {/* Infinite Scroll Trigger */}
            <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
              {isFetchingNextPage && (
                <div className="text-sm text-gray-500">로딩 중...</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Floating Filter Card - Right Side - Only visible on lg+ screens */}
      <div className="hidden lg:block">
        <SearchFilterCard
          onFilterApply={handleFilterApply}
          isModal={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
        />
      </div>

      {/* Mobile Filter Modal - Only visible on lg and below when chip is clicked */}
      <div className="lg:hidden">
        <MobileFilterModal
          isOpen={mobileFilterType !== null}
          onClose={() => setMobileFilterType(null)}
          filterType={mobileFilterType || "category"}
          initialData={{
            selectedCategory: selectedCategory,
            priceMin: mobilePriceMin,
            priceMax: mobilePriceMax,
            dateFrom: mobileDateFrom,
            dateTo: mobileDateTo,
            activeFilters: mobileActiveFilters,
          }}
          categories={categories}
          onApply={handleMobileFilterApply}
        />
      </div>

      {/* Mobile Search Modal - Only visible on lg and below */}
      <div className="lg:hidden">
        <MobileSearchModal
          isOpen={isMobileSearchModalOpen}
          onClose={() => setIsMobileSearchModalOpen(false)}
          itemName={itemName}
          setItemName={setItemName}
          onSearch={handleSearch}
          onCategorySelect={handleCategorySelect}
        />
      </div>
    </div>
  );
}
