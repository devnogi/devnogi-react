"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface EnchantSearchFilterProps {
  prefixList: string[];
  suffixList: string[];
  isLoading: boolean;
  initialPrefix?: string | null;
  initialSuffix?: string | null;
  onChange: (prefix: string | null, suffix: string | null) => void;
}

interface EnchantInputProps {
  list: string[];
  isLoading: boolean;
  initialValue?: string | null;
  placeholder: string;
  onSelect: (value: string | null) => void;
}

function EnchantInput({
  list,
  isLoading,
  initialValue,
  placeholder,
  onSelect,
}: EnchantInputProps) {
  const [selected, setSelected] = useState<string | null>(initialValue ?? null);
  const [inputText, setInputText] = useState(initialValue ?? "");
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(initialValue ?? null);
    setInputText(initialValue ?? "");
  }, [initialValue]);

  useEffect(() => {
    if (!showDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        if (!selected) {
          setInputText("");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown, selected]);

  const filteredList =
    inputText && !selected
      ? list.filter((item) => item.toLowerCase().includes(inputText.toLowerCase()))
      : list;

  const handleSelect = (value: string) => {
    setSelected(value);
    setInputText(value);
    setShowDropdown(false);
    onSelect(value);
  };

  const handleClear = () => {
    setSelected(null);
    setInputText("");
    setShowDropdown(false);
    onSelect(null);
  };

  return (
    <div ref={containerRef} className="relative w-full min-w-0">
      <div className="relative">
        <input
          type="text"
          value={inputText}
          readOnly={!!selected}
          placeholder={isLoading ? "로딩 중..." : placeholder}
          onChange={(e) => {
            if (!selected) {
              setInputText(e.target.value);
              setShowDropdown(true);
            }
          }}
          onFocus={() => {
            if (!selected) setShowDropdown(true);
          }}
          className={`w-full h-8 text-xs px-2 ${selected ? "pr-6" : "pr-2"} rounded-lg border border-gray-300 dark:border-navy-500 bg-white dark:bg-navy-600 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:border-blaanid-500 dark:focus:border-coral-500 focus:ring-1 focus:ring-blaanid-500/20 dark:focus:ring-coral-500/20 truncate`}
        />
        {selected && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      {showDropdown && !selected && filteredList.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-navy-700 rounded-lg border border-gray-200 dark:border-navy-500 max-h-48 overflow-y-auto z-50 shadow-lg">
          {filteredList.slice(0, 30).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full px-2 py-1.5 text-left text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-navy-600 transition-colors first:rounded-t-lg last:rounded-b-lg truncate"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EnchantSearchFilter({
  prefixList,
  suffixList,
  isLoading,
  initialPrefix,
  initialSuffix,
  onChange,
}: EnchantSearchFilterProps) {
  const prefixRef = useRef<string | null>(initialPrefix ?? null);
  const suffixRef = useRef<string | null>(initialSuffix ?? null);

  useEffect(() => {
    prefixRef.current = initialPrefix ?? null;
  }, [initialPrefix]);

  useEffect(() => {
    suffixRef.current = initialSuffix ?? null;
  }, [initialSuffix]);

  const handlePrefixSelect = (value: string | null) => {
    prefixRef.current = value;
    onChange(value, suffixRef.current);
  };

  const handleSuffixSelect = (value: string | null) => {
    suffixRef.current = value;
    onChange(prefixRef.current, value);
  };

  return (
    <div className="bg-gray-50 dark:bg-navy-700 rounded-xl border border-gray-200 dark:border-navy-500 p-3">
      <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
        인챈트 검색
      </h3>
      <div className="flex flex-col gap-2">
        <EnchantInput
          list={prefixList}
          isLoading={isLoading}
          initialValue={initialPrefix}
          placeholder="접두 인챈트"
          onSelect={handlePrefixSelect}
        />
        <EnchantInput
          list={suffixList}
          isLoading={isLoading}
          initialValue={initialSuffix}
          placeholder="접미 인챈트"
          onSelect={handleSuffixSelect}
        />
      </div>
    </div>
  );
}
