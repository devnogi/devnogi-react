"use client";

import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, Settings, Search } from "lucide-react";

interface MobileFilterChipsProps {
  activeFilters: {
    hasPrice: boolean;
    hasDate: boolean;
    hasOptions: boolean;
  };
  onPriceClick: () => void;
  onDateClick: () => void;
  onOptionsClick: () => void;
  onSearchClick: () => void;
}

export default function MobileFilterChips({
  activeFilters,
  onPriceClick,
  onDateClick,
  onOptionsClick,
  onSearchClick,
}: MobileFilterChipsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Price Filter Chip */}
      <button
        onClick={onPriceClick}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
          activeFilters.hasPrice
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-md"
            : "bg-white border-gray-300 text-gray-700 hover:border-blue-400"
        }`}
      >
        <DollarSign className="w-4 h-4" />
        <span className="text-sm font-medium">금액</span>
        {activeFilters.hasPrice && (
          <Badge className="ml-1 bg-white/20 text-white border-0 h-5 px-1.5 text-xs">
            설정됨
          </Badge>
        )}
      </button>

      {/* Date Filter Chip */}
      <button
        onClick={onDateClick}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
          activeFilters.hasDate
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-md"
            : "bg-white border-gray-300 text-gray-700 hover:border-blue-400"
        }`}
      >
        <Calendar className="w-4 h-4" />
        <span className="text-sm font-medium">날짜</span>
        {activeFilters.hasDate && (
          <Badge className="ml-1 bg-white/20 text-white border-0 h-5 px-1.5 text-xs">
            설정됨
          </Badge>
        )}
      </button>

      {/* Options Filter Chip */}
      <button
        onClick={onOptionsClick}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
          activeFilters.hasOptions
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-md"
            : "bg-white border-gray-300 text-gray-700 hover:border-blue-400"
        }`}
      >
        <Settings className="w-4 h-4" />
        <span className="text-sm font-medium">옵션</span>
        {activeFilters.hasOptions && (
          <Badge className="ml-1 bg-white/20 text-white border-0 h-5 px-1.5 text-xs">
            설정됨
          </Badge>
        )}
      </button>

      {/* Search Icon Button */}
      <button
        onClick={onSearchClick}
        className="ml-auto flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all"
        aria-label="아이템 검색"
      >
        <Search className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
}
