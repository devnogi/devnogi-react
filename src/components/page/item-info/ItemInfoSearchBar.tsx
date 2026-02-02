"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ItemInfoSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

export default function ItemInfoSearchBar({
  value,
  onChange,
  onSearch,
}: ItemInfoSearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="아이템 이름으로 검색..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-10 md:h-12 pl-10 md:pl-11 pr-20 rounded-xl border-[var(--color-ds-neutral-tone)] bg-white focus:border-[var(--color-ds-primary)] focus:ring-2 focus:ring-[var(--color-ds-primary)]/20 transition-all text-sm md:text-base"
      />
      <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[var(--color-ds-disabled)]" />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {value && (
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg text-[var(--color-ds-disabled)] hover:text-[var(--color-ds-text)] hover:bg-[var(--color-ds-neutral-100)] transition-colors"
            aria-label="입력 내용 지우기"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onSearch}
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-[var(--color-ds-primary)] hover:bg-[var(--color-ds-primary-hover)] transition-colors"
          type="button"
        >
          검색
        </button>
      </div>
    </div>
  );
}
