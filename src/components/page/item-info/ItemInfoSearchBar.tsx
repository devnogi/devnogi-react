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
        className="h-12 pl-11 pr-20 rounded-xl border-[var(--color-ds-neutral-tone)] bg-white focus:border-[var(--color-ds-blaanid)] focus:ring-2 focus:ring-[var(--color-ds-blaanid)]/20 transition-all text-base"
      />
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-ds-disabled)]" />
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
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-[var(--color-ds-blaanid)] hover:bg-[var(--color-ds-blaanid-hover)] transition-colors"
          type="button"
        >
          검색
        </button>
      </div>
    </div>
  );
}
