"use client";

import {
  DollarSign,
  FolderTree,
  Hammer,
  Settings,
  Sparkles,
  TextSearch,
} from "lucide-react";

interface MobileFilterChipsProps {
  activeFilters: {
    hasExactItemName: boolean;
    hasCategory: boolean;
    hasPrice: boolean;
    hasOptions: boolean;
    hasEnchant: boolean;
    hasMetalware: boolean;
  };
  onExactItemNameToggle: () => void;
  onCategoryClick: () => void;
  onPriceClick: () => void;
  onOptionsClick: () => void;
  onEnchantClick: () => void;
  onMetalwareClick: () => void;
}

export default function MobileFilterChips({
  activeFilters,
  onExactItemNameToggle,
  onCategoryClick,
  onPriceClick,
  onOptionsClick,
  onEnchantClick,
  onMetalwareClick,
}: MobileFilterChipsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Exact Item Name Toggle Chip */}
      <button
        type="button"
        aria-pressed={activeFilters.hasExactItemName}
        onClick={onExactItemNameToggle}
        className={`flex min-h-11 shrink-0 items-center gap-1 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          activeFilters.hasExactItemName
            ? "bg-[var(--color-ds-primary)] text-primary-foreground border-2 border-[var(--color-ds-primary)]"
            : "bg-[var(--color-ds-card)] text-[var(--color-ds-text)] border border-[var(--color-ds-neutral-tone)] hover:border-[var(--color-ds-primary)]"
        }`}
      >
        <TextSearch className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">완전 일치</span>
      </button>

      {/* Category Filter Chip */}
      <button
        type="button"
        aria-pressed={activeFilters.hasCategory}
        onClick={onCategoryClick}
        className={`flex min-h-11 shrink-0 items-center gap-1 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-[var(--color-ds-card)] text-[var(--color-ds-text)] hover:border-[var(--color-ds-primary)] ${
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
        type="button"
        aria-pressed={activeFilters.hasPrice}
        onClick={onPriceClick}
        className={`flex min-h-11 shrink-0 items-center gap-1 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-[var(--color-ds-card)] text-[var(--color-ds-text)] hover:border-[var(--color-ds-primary)] ${
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
        type="button"
        aria-pressed={activeFilters.hasOptions}
        onClick={onOptionsClick}
        className={`flex min-h-11 shrink-0 items-center gap-1 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-[var(--color-ds-card)] text-[var(--color-ds-text)] hover:border-[var(--color-ds-primary)] ${
          activeFilters.hasOptions
            ? "border-2 border-[var(--color-ds-ornamental)]"
            : "border border-[var(--color-ds-neutral-tone)]"
        }`}
      >
        <Settings className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">옵션</span>
      </button>

      {/* Enchant Filter Chip */}
      <button
        type="button"
        aria-pressed={activeFilters.hasEnchant}
        onClick={onEnchantClick}
        className={`flex min-h-11 shrink-0 items-center gap-1 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-[var(--color-ds-card)] text-[var(--color-ds-text)] hover:border-[var(--color-ds-primary)] ${
          activeFilters.hasEnchant
            ? "border-2 border-[var(--color-ds-ornamental)]"
            : "border border-[var(--color-ds-neutral-tone)]"
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">인챈트</span>
      </button>

      {/* Metalware Filter Chip */}
      <button
        type="button"
        aria-pressed={activeFilters.hasMetalware}
        onClick={onMetalwareClick}
        className={`flex min-h-11 shrink-0 items-center gap-1 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-[var(--color-ds-card)] text-[var(--color-ds-text)] hover:border-[var(--color-ds-primary)] ${
          activeFilters.hasMetalware
            ? "border-2 border-[var(--color-ds-ornamental)]"
            : "border border-[var(--color-ds-neutral-tone)]"
        }`}
      >
        <Hammer className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">세공</span>
      </button>
    </div>
  );
}
