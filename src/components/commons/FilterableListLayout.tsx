"use client";

import React, { useState, useEffect, useMemo } from "react";
import AuctionCategory from "@/components/commons/Category";
import AuctionSearch from "@/components/commons/Search";
import { ItemCategory } from "@/data/item-category";
import { useItemCategories } from "@/hooks/useItemCategories";

export default function FilterableListLayout({
  children,
  categoryStorageKey,
  selectedCategory,
  setSelectedCategory,
  itemName,
  setItemName,
}: {
  children: React.ReactNode;
  categoryStorageKey: string;
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
  itemName: string;
  setItemName: (name: string) => void;
}) {
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { data: categories, isLoading } = useItemCategories();

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

  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id);
    if (isClientMounted) {
      localStorage.setItem(categoryStorageKey, id);
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

  const categoryPath = useMemo(
    () => findCategoryPath(categories || [], selectedCategory),
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
    const saved = localStorage.getItem(categoryStorageKey);
    if (saved) {
      setSelectedCategory(saved);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="select-none flex flex-col h-full">
        <div className="flex-shrink-0 px-4 py-2">
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex px-4 py-2">
          <div className="w-44 flex-shrink-0 overflow-auto lg:flex hidden">
            <div className="flex-1 space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="select-none flex flex-col h-full">
      {/* Fixed Floating Category Sidebar */}
      <div className="fixed left-24 top-32 bottom-8 w-56 z-40 lg:block hidden">
        <AuctionCategory
          selectedId={selectedCategory}
          onSelect={handleCategorySelect}
          expandedIds={expandedIds}
          onToggleExpand={handleToggleExpand}
          categories={categories || []}
        />
      </div>

      {/* Centered Main Content Container */}
      <div className="flex-1 flex justify-center overflow-auto">
        <div className="w-full max-w-4xl px-6 py-8">
          {/* Search Section */}
          <div className="mb-6">
            <AuctionSearch
              path={categoryPath}
              onCategorySelect={handleCategorySelect}
              itemName={itemName}
              setItemName={setItemName}
            />
          </div>

          {/* Results Section */}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
