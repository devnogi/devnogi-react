"use client";

import React, { useState, useEffect, useMemo } from "react";
import AuctionCategory from "@/components/commons/Category";
import AuctionSearch from "@/components/commons/Search";
import { fetchCategories } from "@/lib/api/category";
import { ItemCategory } from "@/lib/api/category";

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
  const [itemCategories, setItemCategories] = useState<ItemCategory[]>([]);

  useEffect(() => {
    const getCategories = async () => {
      const categories = await fetchCategories();
      setItemCategories(categories);
    };
    getCategories();
  }, []);

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
    () => findCategoryPath(itemCategories, selectedCategory),
    [selectedCategory, itemCategories],
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

  return (
    <div className="select-none flex flex-col h-full">
      <div className="flex-shrink-0 px-4 py-2">
        <AuctionSearch
          path={categoryPath}
          onCategorySelect={handleCategorySelect}
          itemName={itemName}
          setItemName={setItemName}
        />
      </div>
      <div className="flex px-4 py-2">
        <div className="w-44 flex-shrink-0 overflow-auto lg:flex hidden">
          <AuctionCategory
            categories={itemCategories}
            selectedId={selectedCategory}
            onSelect={handleCategorySelect}
            expandedIds={expandedIds}
            onToggleExpand={handleToggleExpand}
          />
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
