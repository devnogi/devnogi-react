"use client";

import SearchSection from "@/components/commons/Search";
import AuctionHistoryList from "@/components/page/auction-history/AuctionHistoryList";
import CategorySection from "@/components/commons/Category";
import SearchFilterCard from "@/components/page/auction-history/SearchFilterCard";
import { useItemCategories } from "@/hooks/useItemCategories";
import { ItemCategory } from "@/data/item-category";
import {
  useAuctionHistory,
  AuctionHistorySearchParams,
} from "@/hooks/useAuctionHistory";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";

export default function Page() {
  const [itemName, setItemName] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchParams, setSearchParams] = useState<AuctionHistorySearchParams>(
    {},
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isClientMounted, setIsClientMounted] = useState(false);

  const { data: categories = [], isLoading: isCategoriesLoading } =
    useItemCategories();

  const { data, isLoading } = useAuctionHistory({
    ...searchParams,
    page: currentPage,
    size: 20,
  });

  const findCategoryPath = (
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
  };

  const categoryPath = useMemo(
    () => findCategoryPath(categories, selectedCategory),
    [selectedCategory, categories],
  );

  useEffect(() => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      categoryPath.slice(0, -1).forEach((c) => next.add(c.id));
      return next;
    });
  }, [categoryPath]);

  useEffect(() => {
    setIsClientMounted(true);
    const saved = localStorage.getItem("lastSelectedCategoryTradeLog");
    if (saved) {
      setSelectedCategory(saved);
    }
  }, []);

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

  const handleSearch = () => {
    const params: AuctionHistorySearchParams = {};

    // Add item name if provided
    if (itemName.trim()) {
      params.itemName = itemName.trim();
    }

    // Add category filters if not "all"
    if (selectedCategory !== "all") {
      const parts = selectedCategory.split("/");
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
    setCurrentPage(1);
  };

  const handleFilterApply = (filters: Record<string, string | number>) => {
    // Merge existing search params with new filters
    const params: AuctionHistorySearchParams = {
      ...searchParams,
      ...filters,
    };

    setSearchParams(params);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (data?.meta && currentPage < data.meta.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (isCategoriesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="select-none absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Fixed Floating Category Sidebar */}
      <div className="fixed left-24 top-32 bottom-8 w-56 z-40 lg:block hidden">
        <CategorySection
          selectedId={selectedCategory}
          onSelect={handleCategorySelect}
          expandedIds={expandedIds}
          onToggleExpand={handleToggleExpand}
          categories={categories}
        />
      </div>

      {/* Centered Main Content Container */}
      <div className="h-full overflow-auto flex justify-center [scrollbar-gutter:stable]">
        <div className="w-full max-w-4xl px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              경매장 거래 내역
            </h1>
            <p className="text-gray-600">
              마비노기 경매장 아이템 거래 내역을 검색해보세요
            </p>
          </div>

          {/* Search Section */}
          <div className="mb-6">
            <SearchSection
              path={categoryPath}
              onCategorySelect={handleCategorySelect}
              itemName={itemName}
              setItemName={setItemName}
              onSearch={handleSearch}
            />
          </div>

          {/* Results Section */}
          <div>
            {data?.items && (
              <div className="mb-4 text-sm text-gray-600">
                총{" "}
                <span className="font-semibold">{data.meta.totalElements}</span>
                개의 거래 내역 ({data.meta.currentPage} / {data.meta.totalPages}{" "}
                페이지)
              </div>
            )}

            <AuctionHistoryList
              items={data?.items || []}
              isLoading={isLoading}
            />

            {/* Pagination */}
            {data?.meta && data.meta.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="rounded-xl"
                >
                  이전
                </Button>
                <span className="text-gray-700">
                  {currentPage} / {data.meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={currentPage === data.meta.totalPages}
                  className="rounded-xl"
                >
                  다음
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Floating Filter Card - Right Side */}
      <div className="hidden lg:block">
        <SearchFilterCard onFilterApply={handleFilterApply} />
      </div>
    </div>
  );
}
