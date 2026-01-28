"use client";

import { DollarSign, Settings, FolderTree } from "lucide-react";

interface MobileFilterChipsProps {
  activeFilters: {
    hasCategory: boolean;
    hasPrice: boolean;
    hasOptions: boolean;
  };
  onCategoryClick: () => void;
  onPriceClick: () => void;
  onOptionsClick: () => void;
}

export default function MobileFilterChips({
  activeFilters,
  onCategoryClick,
  onPriceClick,
  onOptionsClick,
}: MobileFilterChipsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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

      {/* 날짜 필터 칩 제거됨 - 실시간 경매장은 날짜 필터 없음 */}

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
