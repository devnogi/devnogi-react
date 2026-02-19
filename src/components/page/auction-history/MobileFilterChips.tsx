"use client";

import { DollarSign, Calendar, Settings, FolderTree, TextSearch } from "lucide-react";

interface MobileFilterChipsProps {
  activeFilters: {
    hasExactItemName: boolean;
    hasCategory: boolean;
    hasPrice: boolean;
    hasDate: boolean;
    hasOptions: boolean;
  };
  onExactItemNameToggle: () => void;
  onCategoryClick: () => void;
  onPriceClick: () => void;
  onDateClick: () => void;
  onOptionsClick: () => void;
}

export default function MobileFilterChips({
  activeFilters,
  onExactItemNameToggle,
  onCategoryClick,
  onPriceClick,
  onDateClick,
  onOptionsClick,
}: MobileFilterChipsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Exact Item Name Toggle Chip */}
      <button
        onClick={onExactItemNameToggle}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
          activeFilters.hasExactItemName
            ? "bg-[var(--color-ds-primary)] text-white border-2 border-[var(--color-ds-primary)]"
            : "bg-white dark:bg-navy-800 text-[var(--color-ds-text)] border border-[var(--color-ds-neutral-tone)] hover:border-[var(--color-ds-primary)]"
        }`}
      >
        <TextSearch className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">완전 일치</span>
      </button>

      {/* Category Filter Chip */}
      <button
        onClick={onCategoryClick}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all whitespace-nowrap bg-white text-[var(--color-ds-text)] hover:border-[var(--color-ds-primary)] ${
          activeFilters.hasCategory
            ? "border-2 border-[var(--color-ds-ornamental)]"
            : "border border-[var(--color-ds-neutral-tone)]"
        }`}
      >
        <FolderTree className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">카테고리</span>
      </button>

      {/* Price Filter Chip */}
      <button
        onClick={onPriceClick}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all whitespace-nowrap bg-white text-[var(--color-ds-text)] hover:border-[var(--color-ds-primary)] ${
          activeFilters.hasPrice
            ? "border-2 border-[var(--color-ds-ornamental)]"
            : "border border-[var(--color-ds-neutral-tone)]"
        }`}
      >
        <DollarSign className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">금액</span>
      </button>

      {/* Date Filter Chip */}
      <button
        onClick={onDateClick}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all whitespace-nowrap bg-white text-[var(--color-ds-text)] hover:border-[var(--color-ds-primary)] ${
          activeFilters.hasDate
            ? "border-2 border-[var(--color-ds-ornamental)]"
            : "border border-[var(--color-ds-neutral-tone)]"
        }`}
      >
        <Calendar className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">날짜</span>
      </button>

      {/* Options Filter Chip */}
      <button
        onClick={onOptionsClick}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all whitespace-nowrap bg-white text-[var(--color-ds-text)] hover:border-[var(--color-ds-primary)] ${
          activeFilters.hasOptions
            ? "border-2 border-[var(--color-ds-ornamental)]"
            : "border border-[var(--color-ds-neutral-tone)]"
        }`}
      >
        <Settings className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">옵션</span>
      </button>
    </div>
  );
}
