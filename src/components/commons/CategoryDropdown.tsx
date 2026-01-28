"use client";

import { ItemCategory } from "@/data/item-category";
import { ChevronDown, ChevronRight, Menu } from "lucide-react";
import clsx from "clsx";
import { useEffect, useRef } from "react";

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
          "px-2 py-1.5 cursor-pointer text-sm rounded-lg flex items-center transition-colors",
          isSelected
            ? "bg-[var(--color-ds-primary-50)] text-[var(--color-ds-primary)] font-semibold"
            : "text-[var(--color-ds-text)] hover:bg-[var(--color-ds-neutral-50)]"
        )}
        onClick={handleSelect}
      >
        {hasChildren && (
          <span
            className="w-4 flex-shrink-0 text-center transition-transform"
            onClick={handleToggle}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </span>
        )}
        <span className={clsx(!hasChildren && "ml-4")}>{category.name}</span>
      </span>

      {isExpanded && hasChildren && (
        <ul className="pl-3 mt-0.5 space-y-0.5">
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

interface CategoryDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  selectedId: string;
  onSelect: (id: string) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  categories: ItemCategory[];
}

export default function CategoryDropdown({
  isOpen,
  onToggle,
  onClose,
  selectedId,
  onSelect,
  expandedIds,
  onToggleExpand,
  categories,
}: CategoryDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (id: string) => {
    onSelect(id);
    onClose();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={onToggle}
        className={clsx(
          "flex items-center justify-center w-8 h-8 rounded-xl transition-colors",
          isOpen
            ? "bg-[var(--color-ds-primary-50)] text-[var(--color-ds-primary)]"
            : "hover:bg-cream-100 text-cream-600"
        )}
        aria-label="카테고리 메뉴 열기"
        aria-expanded={isOpen}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 max-h-[60vh] bg-white rounded-xl border border-[var(--color-ds-neutral-tone)] shadow-[0_8px_24px_rgba(61,56,47,0.12)] z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-[var(--color-ds-neutral-tone)] bg-[var(--color-ds-neutral-50)]">
            <h3 className="font-semibold text-sm text-[var(--color-ds-text)]">
              카테고리 선택
            </h3>
          </div>

          {/* Category List */}
          <div className="flex-1 p-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <ul className="space-y-0.5">
              {categories.map((category) => (
                <RecursiveCategoryItem
                  key={category.id}
                  category={category}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                  expandedIds={expandedIds}
                  onToggleExpand={onToggleExpand}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
