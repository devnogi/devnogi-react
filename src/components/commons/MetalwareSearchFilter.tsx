"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Plus, X, ChevronDown } from "lucide-react";

export interface MetalwareFilterItem {
  id: string;
  name: string;
  levelFrom: string;
  levelTo: string;
}

interface MetalwareSearchFilterProps {
  metalwareList: string[];
  isLoading?: boolean;
  initialItems?: MetalwareFilterItem[];
  onChange: (filters: MetalwareFilterItem[]) => void;
}

const MAX_METALWARE = 3;

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function MetalwareSearchFilter({
  metalwareList,
  isLoading = false,
  initialItems,
  onChange,
}: MetalwareSearchFilterProps) {
  const [items, setItems] = useState<MetalwareFilterItem[]>(initialItems ?? []);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setActiveDropdownId(null);
      }
    };
    if (activeDropdownId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdownId]);

  const handleAddItem = useCallback(() => {
    if (items.length >= MAX_METALWARE) return;
    const newItem: MetalwareFilterItem = {
      id: generateId(),
      name: "",
      levelFrom: "",
      levelTo: "",
    };
    const next = [...items, newItem];
    setItems(next);
    onChange(next);
  }, [items, onChange]);

  const handleRemoveItem = useCallback(
    (id: string) => {
      const next = items.filter((item) => item.id !== id);
      setItems(next);
      onChange(next);
      if (activeDropdownId === id) setActiveDropdownId(null);
    },
    [items, onChange, activeDropdownId],
  );

  const handleNameChange = useCallback(
    (id: string, value: string) => {
      const next = items.map((item) =>
        item.id === id ? { ...item, name: value } : item,
      );
      setItems(next);
      onChange(next);
      setActiveDropdownId(id);
    },
    [items, onChange],
  );

  const handleSelectSuggestion = useCallback(
    (id: string, name: string) => {
      const next = items.map((item) =>
        item.id === id ? { ...item, name } : item,
      );
      setItems(next);
      onChange(next);
      setActiveDropdownId(null);
    },
    [items, onChange],
  );

  const handleLevelChange = useCallback(
    (id: string, field: "levelFrom" | "levelTo", value: string) => {
      const next = items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      );
      setItems(next);
      onChange(next);
    },
    [items, onChange],
  );

  const getSuggestions = useCallback(
    (name: string) => {
      if (!name.trim()) return metalwareList.slice(0, 8);
      return metalwareList
        .filter((m) => m.toLowerCase().includes(name.toLowerCase()))
        .slice(0, 8);
    },
    [metalwareList],
  );

  return (
    <div
      ref={containerRef}
      className="bg-gray-50 dark:bg-navy-700 rounded-xl border border-gray-200 dark:border-navy-500 p-3"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300">
          세공 검색
        </h3>
        {items.length < MAX_METALWARE && (
          <button
            type="button"
            onClick={handleAddItem}
            disabled={isLoading}
            className="flex items-center gap-1 text-xs text-blaanid-600 dark:text-coral-400 hover:text-blaanid-700 dark:hover:text-coral-300 disabled:opacity-40 transition-colors"
          >
            <Plus className="w-3 h-3" />
            추가
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <button
          type="button"
          onClick={handleAddItem}
          disabled={isLoading}
          className="w-full h-9 rounded-xl border border-dashed border-gray-300 dark:border-navy-400 flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:border-blaanid-400 dark:hover:border-coral-500 hover:text-blaanid-500 dark:hover:text-coral-400 disabled:opacity-40 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          {isLoading ? "로딩 중..." : "세공 조건 추가 (최대 3개)"}
        </button>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => {
            const suggestions = getSuggestions(item.name);
            const showDropdown =
              activeDropdownId === item.id && suggestions.length > 0;

            return (
              <div key={item.id} className="space-y-1.5">
                {index > 0 && (
                  <div className="border-t border-gray-200 dark:border-navy-600 pt-1.5" />
                )}
                {/* 세공 이름 자동완성 */}
                <div className="relative">
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <Input
                        type="text"
                        placeholder="세공 이름 입력"
                        value={item.name}
                        onChange={(e) =>
                          handleNameChange(item.id, e.target.value)
                        }
                        onFocus={() => setActiveDropdownId(item.id)}
                        className="h-8 rounded-xl text-xs pr-7 border-gray-300 dark:border-navy-500 bg-white dark:bg-navy-600 dark:text-white dark:placeholder-gray-400 focus:border-blaanid-500 dark:focus:border-coral-500 focus:ring-2 focus:ring-blaanid-500/20 dark:focus:ring-coral-500/20"
                      />
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 자동완성 드롭다운 */}
                  {showDropdown && (
                    <div className="absolute top-full left-0 right-7 mt-1 bg-white dark:bg-navy-700 rounded-xl shadow-[0_8px_24px_rgba(61,56,47,0.12)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-navy-500 max-h-44 overflow-auto z-50">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectSuggestion(item.id, suggestion);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs transition-colors first:rounded-t-xl last:rounded-b-xl ${
                            item.name === suggestion
                              ? "bg-blaanid-50 dark:bg-coral-500/10 text-blaanid-700 dark:text-coral-300 font-medium"
                              : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-navy-600"
                          }`}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 레벨 범위 */}
                <div className="flex items-center gap-1.5 pl-0">
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                    레벨
                  </span>
                  <Input
                    type="number"
                    placeholder="시작"
                    value={item.levelFrom}
                    onChange={(e) =>
                      handleLevelChange(item.id, "levelFrom", e.target.value)
                    }
                    min={1}
                    max={30}
                    className="h-8 rounded-xl text-xs border-gray-300 dark:border-navy-500 bg-white dark:bg-navy-600 dark:text-white dark:placeholder-gray-400 focus:border-blaanid-500 dark:focus:border-coral-500 focus:ring-2 focus:ring-blaanid-500/20 dark:focus:ring-coral-500/20"
                  />
                  <span className="text-gray-400 dark:text-gray-500 text-xs shrink-0">
                    ~
                  </span>
                  <Input
                    type="number"
                    placeholder="종료"
                    value={item.levelTo}
                    onChange={(e) =>
                      handleLevelChange(item.id, "levelTo", e.target.value)
                    }
                    min={1}
                    max={30}
                    className="h-8 rounded-xl text-xs border-gray-300 dark:border-navy-500 bg-white dark:bg-navy-600 dark:text-white dark:placeholder-gray-400 focus:border-blaanid-500 dark:focus:border-coral-500 focus:ring-2 focus:ring-blaanid-500/20 dark:focus:ring-coral-500/20"
                  />
                  {/* 삭제 버튼 자리 맞추기 */}
                  <div className="w-7 shrink-0" />
                </div>
              </div>
            );
          })}

          {items.length < MAX_METALWARE && (
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full h-8 rounded-xl border border-dashed border-gray-300 dark:border-navy-400 flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:border-blaanid-400 dark:hover:border-coral-500 hover:text-blaanid-500 dark:hover:text-coral-400 transition-all"
            >
              <Plus className="w-3 h-3" />
              세공 추가 ({items.length}/{MAX_METALWARE})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
