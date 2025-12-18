"use client";

import { DollarSign, Calendar, Settings, FolderTree } from "lucide-react";

interface MobileFilterChipsProps {
  activeFilters: {
    hasCategory: boolean;
    hasPrice: boolean;
    hasDate: boolean;
    hasOptions: boolean;
  };
  onCategoryClick: () => void;
  onPriceClick: () => void;
  onDateClick: () => void;
  onOptionsClick: () => void;
}

export default function MobileFilterChips({
  activeFilters,
  onCategoryClick,
  onPriceClick,
  onDateClick,
  onOptionsClick,
}: MobileFilterChipsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Category Filter Chip */}
      <button
        onClick={onCategoryClick}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap bg-white text-gray-700 hover:border-blue-400 ${
          activeFilters.hasCategory
            ? "border-2 border-gray-800"
            : "border border-gray-300"
        }`}
      >
        <FolderTree className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">카테고리</span>
      </button>

      {/* Price Filter Chip */}
      <button
        onClick={onPriceClick}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap bg-white text-gray-700 hover:border-blue-400 ${
          activeFilters.hasPrice
            ? "border-2 border-gray-800"
            : "border border-gray-300"
        }`}
      >
        <DollarSign className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">금액</span>
      </button>

      {/* Date Filter Chip */}
      <button
        onClick={onDateClick}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap bg-white text-gray-700 hover:border-blue-400 ${
          activeFilters.hasDate
            ? "border-2 border-gray-800"
            : "border border-gray-300"
        }`}
      >
        <Calendar className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">날짜</span>
      </button>

      {/* Options Filter Chip */}
      <button
        onClick={onOptionsClick}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap bg-white text-gray-700 hover:border-blue-400 ${
          activeFilters.hasOptions
            ? "border-2 border-gray-800"
            : "border border-gray-300"
        }`}
      >
        <Settings className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">옵션</span>
      </button>
    </div>
  );
}
