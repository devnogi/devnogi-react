"use client";

import { useState, useCallback, useEffect } from "react";
import { useItemInfoDetail } from "@/hooks/useItemInfoDetail";
import { useItemInfoCategories } from "@/hooks/useItemInfoCategories";
import { ItemInfoSearchParams } from "@/types/item-info";
import ItemInfoSearchBar from "./ItemInfoSearchBar";
import ItemInfoCategoryFilter from "./ItemInfoCategoryFilter";
import ItemInfoTable from "./ItemInfoTable";
import ItemInfoPagination from "./ItemInfoPagination";
import { Info, ArrowUpDown } from "lucide-react";

const PAGE_SIZE = 20;

export default function ItemInfoPage() {
  const { data: categories = [], isLoading: isCategoriesLoading } = useItemInfoCategories();

  const [topCategory, setTopCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [searchName, setSearchName] = useState("");
  const [appliedName, setAppliedName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("ASC");

  // 카테고리 데이터가 로드되면 첫 번째 카테고리 선택
  useEffect(() => {
    if (categories.length > 0 && !topCategory) {
      setTopCategory(categories[0].topCategory);
    }
  }, [categories, topCategory]);

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

  const handleSearch = useCallback(() => {
    setAppliedName(searchName);
    setCurrentPage(1);
  }, [searchName]);

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
      <div className="min-h-screen bg-[var(--color-ds-background)] py-8 px-4">
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
    <div className="min-h-screen bg-[var(--color-ds-background)] py-6 md:py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-ds-text)]">
            아이템 정보
          </h1>
          <p className="mt-2 text-sm md:text-base text-[var(--color-ds-secondary)]">
            마비노기 아이템의 상세 정보를 확인하세요.
          </p>
        </div>

        {/* Search */}
        <ItemInfoSearchBar
          value={searchName}
          onChange={setSearchName}
          onSearch={handleSearch}
        />

        {/* Category Filter */}
        <div className="bg-white rounded-2xl border border-[var(--color-ds-neutral-tone)] p-4 md:p-6">
          <ItemInfoCategoryFilter
            categories={categories}
            selectedTopCategory={topCategory}
            selectedSubCategory={subCategory}
            onTopCategoryChange={handleTopCategoryChange}
            onSubCategoryChange={handleSubCategoryChange}
          />
        </div>

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
              <span className="ml-2 text-[var(--color-ds-blaanid)]">로딩 중...</span>
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
