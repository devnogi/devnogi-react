"use client";

import AuctionRealtimeList from "@/components/page/auction-realtime/AuctionRealtimeList";
import { Badge } from "@/components/ui/badge";
import React from "react";
import CategorySection from "@/components/commons/Category";
import CategoryDropdown from "@/components/commons/CategoryDropdown";
import SearchFilterCard from "@/components/page/auction-realtime/SearchFilterCard";
import MobileFilterChips from "@/components/page/auction-realtime/MobileFilterChips";
import MobileFilterModal from "@/components/page/auction-realtime/MobileFilterModal";
import { useItemCategories } from "@/hooks/useItemCategories";
import { ItemCategory } from "@/data/item-category";
import { useInfiniteAuctionRealtime } from "@/hooks/useInfiniteAuctionRealtime";
import { useAuctionHistoryLayout } from "@/hooks/useAuctionHistoryLayout";
import { AuctionRealtimeSearchParams } from "@/types/auction-realtime";
import { ActiveFilter } from "@/types/search-filter";
import { useState, useEffect, useMemo, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// URL params reader component - URL 파라미터 변경 시마다 검색 동작
function UrlParamsReader({
  onParamsLoad,
}: {
  onParamsLoad: (params: { itemName?: string; category?: string }) => void;
}) {
  const urlSearchParams = useSearchParams();
  const prevParamsRef = useRef<string>("");

  useEffect(() => {
    const itemName = urlSearchParams.get("itemName") || undefined;
    const category = urlSearchParams.get("category") || undefined;

    // 현재 URL 파라미터를 문자열로 직렬화하여 이전 값과 비교
    const currentParams = JSON.stringify({ itemName, category });

    // 파라미터가 변경되었고, 유효한 검색 조건이 있을 때만 실행
    if (currentParams !== prevParamsRef.current && (itemName || category)) {
      prevParamsRef.current = currentParams;
      onParamsLoad({ itemName, category });
    }
  }, [urlSearchParams, onParamsLoad]);

  return null;
}

export default function Page() {
  const [itemName, setItemName] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchParams, setSearchParams] = useState<AuctionRealtimeSearchParams>(
    {},
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  // 실시간 경매장 기본 정렬: 만료일 오름차순 (만료 임박순)
  const [sortOption, setSortOption] = useState<{
    label: string;
    sortBy: string;
    direction: "asc" | "desc";
  }>({ label: "만료 임박순", sortBy: "dateAuctionExpire", direction: "asc" });

  // Mobile filter states - 날짜 필터 제거
  const [mobileFilterType, setMobileFilterType] = useState<
    "category" | "price" | "options" | null
  >(null);
  const [mobilePriceMin, setMobilePriceMin] = useState("");
  const [mobilePriceMax, setMobilePriceMax] = useState("");
  const [mobileActiveFilters, setMobileActiveFilters] = useState<ActiveFilter[]>([]);

  const { data: categories = [], isLoading: isCategoriesLoading } =
    useItemCategories();

  // 레이아웃 모드 관리 - 화면 크기에 따라 자동 전환
  const {
    layoutMode,
    showCategorySidebar,
    showFilterSidebar,
    showMobileFilter,
  } = useAuctionHistoryLayout();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteAuctionRealtime(searchParams);

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

  // Callback for URL params initialization
  const handleUrlParamsLoad = useCallback(
    (params: { itemName?: string; category?: string }) => {
      const newSearchParams: AuctionRealtimeSearchParams = {};

      if (params.itemName) {
        setItemName(params.itemName);
        newSearchParams.itemName = params.itemName;
      }

      if (params.category) {
        setSelectedCategory(params.category);
        const parts = params.category.split("/");
        if (parts.length === 1) {
          newSearchParams.itemTopCategory = parts[0];
        } else if (parts.length === 2) {
          newSearchParams.itemTopCategory = parts[0];
          newSearchParams.itemSubCategory = parts[1];
        }
      }

      setSearchParams(newSearchParams);
    },
    []
  );

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

  const handleFilterApply = (filters: AuctionRealtimeSearchParams) => {
    // Merge existing search params with new filters
    const params: AuctionRealtimeSearchParams = {
      ...searchParams,
      ...filters,
    };

    setSearchParams(params);
  };

  const handleMobileFilterApply = (data: {
    selectedCategory?: string;
    priceMin?: string;
    priceMax?: string;
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
    if (data.activeFilters !== undefined)
      setMobileActiveFilters(data.activeFilters);

    // Build search params
    const params: AuctionRealtimeSearchParams = { ...searchParams };

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

    // 날짜 필터 제거됨 - 실시간 경매장은 날짜 필터 없음

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
        <div className="text-[var(--color-ds-disabled)]">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="select-none min-h-full bg-[var(--color-ds-background)] dark:bg-navy-900 -mx-4 md:-mx-6 -my-6 md:-my-8">
      {/* URL Params Reader - wrapped in Suspense for SSR compatibility */}
      <Suspense fallback={null}>
        <UrlParamsReader onParamsLoad={handleUrlParamsLoad} />
      </Suspense>

      {/* Fixed Floating Category Sidebar - 메인 콘텐츠 기준 왼쪽에 배치 */}
      {showCategorySidebar && (
        <div
          className="fixed top-[140px] bottom-8 w-56 z-40"
          style={{ left: "max(16px, calc(50% - 678px))" }}
        >
          <CategorySection
            selectedId={selectedCategory}
            onSelect={handleCategorySelect}
            expandedIds={expandedIds}
            onToggleExpand={handleToggleExpand}
            categories={categories}
          />
        </div>
      )}


      {/* Centered Main Content Container */}
      <div
        className={`min-h-full flex justify-center [scrollbar-gutter:stable] ${
          showCategorySidebar
            ? "px-72"
            : showFilterSidebar
              ? "pr-72"
              : ""
        }`}
      >
        <div className="w-full max-w-4xl px-4 md:px-6 pt-4 md:pt-6 pb-4 md:pb-8">
          {/* Mobile Filter Chips - 모바일 뷰에서만 표시, 날짜 필터 제거됨 */}
          {showMobileFilter && (
            <div className="mb-4">
            <MobileFilterChips
              activeFilters={{
                hasCategory: selectedCategory !== "all",
                hasPrice: !!(mobilePriceMin || mobilePriceMax),
                hasOptions: mobileActiveFilters.length > 0,
              }}
              onCategoryClick={() => setMobileFilterType("category")}
              onPriceClick={() => setMobileFilterType("price")}
              onOptionsClick={() => setMobileFilterType("options")}
            />
            </div>
          )}

          {/* Category Breadcrumb - 필터 사이드바가 표시될 때 보임 (tablet/desktop) */}
          {showFilterSidebar && categoryPath.length > 0 && (
            <div className="mb-4 flex items-center gap-2 text-sm flex-wrap">
              {/* Category Dropdown - 2xl 미만에서만 표시 */}
              <div className="2xl:hidden">
                <CategoryDropdown
                  isOpen={isCategoryDropdownOpen}
                  onToggle={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  onClose={() => setIsCategoryDropdownOpen(false)}
                  selectedId={selectedCategory}
                  onSelect={handleCategorySelect}
                  expandedIds={expandedIds}
                  onToggleExpand={handleToggleExpand}
                  categories={categories}
                />
              </div>
              {categoryPath.map((p, index) => (
                <React.Fragment key={p.id}>
                  {index > 0 && <span className="text-cream-400">›</span>}
                  <Badge
                    className="rounded-full cursor-pointer bg-clover-50 text-clover-700 hover:bg-clover-100 border-0 font-medium"
                    onClick={() => handleCategorySelect(p.id)}
                  >
                    {p.name}
                  </Badge>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Results Section */}
          <div>
            {totalElements > 0 && (
              <div className="mb-4 flex items-center justify-between">
                <div className="text-xs md:text-sm text-[var(--color-ds-disabled)]">
                  {itemName ? (
                    <>
                      <span className="font-semibold text-[var(--color-ds-primary)]">{itemName}</span> 검색결과{" "}
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
                    className="flex items-center gap-1 px-3 py-1.5 text-xs md:text-sm text-[var(--color-ds-text)] hover:bg-[var(--color-ds-neutral-50)] rounded-xl transition-colors"
                  >
                    <span className="font-medium">{sortOption.label}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isSortDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl border border-[var(--color-ds-neutral-tone)] py-2 z-50 min-w-[180px]">
                      {/* 실시간 경매장 정렬 옵션: 만료일, 등록일, 가격, 아이템명 */}
                      {[
                        { label: "만료 임박순", sortBy: "dateAuctionExpire", direction: "asc" as const },
                        { label: "만료 늦은순", sortBy: "dateAuctionExpire", direction: "desc" as const },
                        { label: "등록 최신순", sortBy: "dateAuctionRegister", direction: "desc" as const },
                        { label: "등록 오래된순", sortBy: "dateAuctionRegister", direction: "asc" as const },
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
                              ? "bg-[var(--color-ds-primary-50)] text-[var(--color-ds-primary)] font-semibold"
                              : "text-[var(--color-ds-text)] hover:bg-[var(--color-ds-neutral-50)]"
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

            <AuctionRealtimeList items={allItems} isLoading={isLoading} />

            {/* Infinite Scroll Trigger */}
            <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
              {isFetchingNextPage && (
                <div className="text-sm text-[var(--color-ds-disabled)]">로딩 중...</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Floating Filter Card - 메인 콘텐츠 기준 오른쪽에 배치 */}
      {showFilterSidebar && (
        <SearchFilterCard
          onFilterApply={handleFilterApply}
          isModal={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          layoutMode={layoutMode}
        />
      )}

      {/* Mobile Filter Modal - 모바일 뷰에서만 표시, 날짜 필터 제거됨 */}
      {showMobileFilter && (
        <MobileFilterModal
          isOpen={mobileFilterType !== null}
          onClose={() => setMobileFilterType(null)}
          filterType={mobileFilterType || "category"}
          initialData={{
            selectedCategory: selectedCategory,
            priceMin: mobilePriceMin,
            priceMax: mobilePriceMax,
            activeFilters: mobileActiveFilters,
          }}
          categories={categories}
          onApply={handleMobileFilterApply}
        />
      )}

    </div>
  );
}
