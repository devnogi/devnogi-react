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
          "px-2 py-2 cursor-pointer text-sm rounded-lg flex items-center transition-colors",
          isSelected
            ? "bg-blue-50 text-blue-700 font-semibold"
            : "text-gray-700 hover:bg-gray-100",
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
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
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
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-xl">
      <div className="text-center border-b border-gray-200 py-3 px-4 bg-gray-50 rounded-t-2xl">
        <h3 className="font-semibold text-gray-900">카테고리</h3>
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
