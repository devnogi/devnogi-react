"use client";

import clsx from "clsx";
import { useState, useEffect, useRef } from "react";
import { ItemCategory } from "@/data/item-category";

const RecursiveCategoryItem = ({
  category,
  selectedId,
  onSelect,
  expandedIds,
  onToggleExpand,
}: {
  category: ItemCategory;
  selectedId: string;
  onSelect: (id: string) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
}) => {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedIds.has(category.id);
  const isSelected = category.id === selectedId;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggleExpand(category.id);
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(category.id);
    handleToggle(e);
  };

  return (
    <li>
      <span
        className={clsx(
          "px-2 py-2 cursor-pointer text-sm rounded-xl flex items-center transition-colors",
          isSelected
            ? "bg-clover-50 text-clover-700 font-semibold"
            : "text-cream-700 hover:bg-cream-100",
        )}
        onClick={handleSelect}
      >
        {hasChildren && (
          <span
            className={clsx(
              "w-5 flex-shrink-0 text-center text-xs font-bold transition-transform",
              isExpanded && "rotate-0",
              !isExpanded && "-rotate-90",
            )}
            onClick={handleToggle}
          >
            ▼
          </span>
        )}
        <span className={clsx(!hasChildren && "ml-5")}>{category.name}</span>
      </span>

      {isExpanded && hasChildren && (
        <ul className="pl-3 mt-1 space-y-1">
          {category.children!.map((child) => (
            <RecursiveCategoryItem
              key={child.id}
              category={child}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default function ItemCategorySection({
  selectedId,
  onSelect,
  expandedIds,
  onToggleExpand,
  categories,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  categories: ItemCategory[];
}) {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    setIsScrolling(true);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-white rounded-[20px] border border-cream-200 shadow-[0_8px_24px_rgba(61,56,47,0.08)]">
      <div className="text-center border-b border-cream-200 py-3 px-4 bg-cream-50 rounded-t-[20px]">
        <h3 className="font-semibold text-cream-900">카테고리</h3>
      </div>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={clsx(
          "flex-1 p-3 overflow-y-auto category-scrollbar",
          isScrolling && "scrolling",
        )}
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: isScrolling
            ? "rgb(156 163 175) transparent"
            : "transparent transparent",
        }}
      >
        <ul className="space-y-1">
          {categories.map((category) => (
            <RecursiveCategoryItem
              key={category.id}
              category={category}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
