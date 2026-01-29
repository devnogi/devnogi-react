"use client";

import { Search, X } from "lucide-react";

interface ItemOptionSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function ItemOptionSearchBar({
  value,
  onChange,
  placeholder = "옵션명 또는 설명으로 검색...",
}: ItemOptionSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-ds-disabled)]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 pl-12 pr-10 rounded-xl border border-[var(--color-ds-neutral-tone)] bg-white text-[var(--color-ds-text)] placeholder:text-[var(--color-ds-disabled)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ds-primary)] focus:border-transparent transition-all"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--color-ds-neutral-50)] transition-colors"
        >
          <X className="w-4 h-4 text-[var(--color-ds-disabled)]" />
        </button>
      )}
    </div>
  );
}
