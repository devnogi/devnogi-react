"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useItemInfoDetail } from "@/hooks/useItemInfoDetail";
import { useItemInfoCategories } from "@/hooks/useItemInfoCategories";
import { ItemInfoSearchParams } from "@/types/item-info";
import ItemInfoCategoryFilter from "./ItemInfoCategoryFilter";
import ItemInfoTable from "./ItemInfoTable";
import ItemInfoPagination from "./ItemInfoPagination";
import { Info, ArrowUpDown } from "lucide-react";

const PAGE_SIZE = 20;
const DEFAULT_SORT_DIRECTION: "ASC" | "DESC" = "ASC";

function parsePositiveInt(raw: string | null, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function parseSortDirection(raw: string | null): "ASC" | "DESC" {
  if (!raw) return DEFAULT_SORT_DIRECTION;
  return raw.toUpperCase() === "DESC" ? "DESC" : "ASC";
}

export default function ItemInfoPage() {
  const router = useRouter();
  const pathname = usePathname();
  const urlSearchParams = useSearchParams();
  const lastSyncedQueryRef = useRef<string>("");
  const { data: categories = [], isLoading: isCategoriesLoading } = useItemInfoCategories();

  const [topCategory, setTopCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [appliedName, setAppliedName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] =
    useState<"ASC" | "DESC">(DEFAULT_SORT_DIRECTION);

  // URL -> state 동기화
  useEffect(() => {
    const nextTopCategory =
      urlSearchParams.get("top_category") ||
      urlSearchParams.get("topCategory") ||
      "";
    const nextSubCategory =
      urlSearchParams.get("sub_category") ||
      urlSearchParams.get("subCategory") ||
      "";
    const nextItemName =
      urlSearchParams.get("item_name") ||
      urlSearchParams.get("itemName") ||
      urlSearchParams.get("name") ||
      "";
    const nextPage = parsePositiveInt(urlSearchParams.get("page"), 1);
    const nextSortDirection = parseSortDirection(
      urlSearchParams.get("direction"),
    );

    const parsedQuery = new URLSearchParams();
    if (nextTopCategory) {
      parsedQuery.set("top_category", nextTopCategory);
    }
    if (nextSubCategory) {
      parsedQuery.set("sub_category", nextSubCategory);
    }
    if (nextItemName) {
      parsedQuery.set("item_name", nextItemName);
    }
    if (nextPage > 1) {
      parsedQuery.set("page", String(nextPage));
    }
    if (nextSortDirection !== DEFAULT_SORT_DIRECTION) {
      parsedQuery.set("direction", nextSortDirection);
    }
    const normalizedQuery = new URLSearchParams(
      Array.from(parsedQuery.entries()).sort(([a], [b]) => a.localeCompare(b)),
    ).toString();

    if (normalizedQuery === lastSyncedQueryRef.current) {
      return;
    }

    lastSyncedQueryRef.current = normalizedQuery;
    setTopCategory(nextTopCategory);
    setSubCategory(nextSubCategory);
    setAppliedName(nextItemName);
    setCurrentPage(nextPage);
    setSortDirection(nextSortDirection);
  }, [urlSearchParams]);

  // 카테고리 로드 후 기본 탑카테고리 설정
  useEffect(() => {
    if (categories.length > 0 && !topCategory) {
      setTopCategory(categories[0].topCategory);
    }
  }, [categories, topCategory]);

  // state -> URL 동기화
  useEffect(() => {
    const params = new URLSearchParams();
    if (topCategory) {
      params.set("top_category", topCategory);
    }
    if (subCategory) {
      params.set("sub_category", subCategory);
    }
    if (appliedName) {
      params.set("item_name", appliedName);
    }
    if (currentPage > 1) {
      params.set("page", String(currentPage));
    }
    if (sortDirection !== DEFAULT_SORT_DIRECTION) {
      params.set("direction", sortDirection);
    }

    const nextQuery = new URLSearchParams(
      Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b)),
    ).toString();

    if (nextQuery === lastSyncedQueryRef.current) {
      return;
    }

    lastSyncedQueryRef.current = nextQuery;
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [topCategory, subCategory, appliedName, currentPage, sortDirection, router, pathname]);

  const searchParams: ItemInfoSearchParams | null = topCategory
    ? {
        topCategory,
        subCategory: subCategory || undefined,
        name: appliedName || undefined,
        page: currentPage,
        size: PAGE_SIZE,
        direction: sortDirection,
      }
    : null;

  const { data: pageData, isLoading, isFetching } = useItemInfoDetail(searchParams);

  const handleTopCategoryChange = useCallback((category: string) => {
    setTopCategory(category);
    setSubCategory("");
    setCurrentPage(1);
  }, []);

  const handleSubCategoryChange = useCallback((category: string) => {
    setSubCategory(category);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toggleSortDirection = useCallback(() => {
    setSortDirection((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    setCurrentPage(1);
  }, []);

  if (isCategoriesLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-ds-background)] dark:bg-navy-900 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[var(--color-ds-neutral-100)] rounded-lg w-1/3" />
            <div className="h-12 bg-[var(--color-ds-neutral-100)] rounded-xl" />
            <div className="h-24 bg-[var(--color-ds-neutral-100)] rounded-xl" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-14 bg-[var(--color-ds-neutral-100)] rounded-2xl"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-ds-background)] dark:bg-navy-900 -mx-4 md:-mx-6 -my-6 md:-my-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Category Filter */}
        <ItemInfoCategoryFilter
          categories={categories}
          selectedTopCategory={topCategory}
          selectedSubCategory={subCategory}
          onTopCategoryChange={handleTopCategoryChange}
          onSubCategoryChange={handleSubCategoryChange}
        />

        {/* Results Info & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-[var(--color-ds-disabled)]">
            <Info className="w-4 h-4" />
            <span>
              {pageData ? (
                <>
                  총{" "}
                  <span className="font-semibold text-[var(--color-ds-text)]">
                    {pageData.totalElements}
                  </span>
                  개의 아이템
                </>
              ) : (
                "카테고리를 선택해주세요"
              )}
            </span>
            {isFetching && (
              <span className="ml-2 text-[var(--color-ds-primary)]">로딩 중...</span>
            )}
          </div>

          <button
            onClick={toggleSortDirection}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-ds-secondary)] hover:bg-[var(--color-ds-neutral-100)] transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
            이름순 {sortDirection === "ASC" ? "오름차순" : "내림차순"}
          </button>
        </div>

        {/* Table */}
        <ItemInfoTable items={pageData?.content || []} isLoading={isLoading} />

        {/* Pagination */}
        {pageData && (
          <ItemInfoPagination
            currentPage={currentPage}
            totalPages={pageData.totalPages}
            totalElements={pageData.totalElements}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
