"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ItemInfo } from "@/hooks/useItemInfos";
import clsx from "clsx";

interface AutocompleteProps {
  items: ItemInfo[];
  value: string;
  onSelect: (item: ItemInfo) => void;
  isLoading?: boolean;
  onArrowUpFromFirst?: () => void;
  externalSelectedIndex?: number;
  onSelectedIndexChange?: (index: number) => void;
  externalIsOpen?: boolean;
  onIsOpenChange?: (isOpen: boolean) => void;
}

export default function Autocomplete({
  items,
  value,
  onSelect,
  isLoading = false,
  onArrowUpFromFirst,
  externalSelectedIndex,
  onSelectedIndexChange,
  externalIsOpen,
  onIsOpenChange,
}: AutocompleteProps) {
  const [internalSelectedIndex, setInternalSelectedIndex] = useState(-1);
  const selectedIndex =
    externalSelectedIndex !== undefined
      ? externalSelectedIndex
      : internalSelectedIndex;
  const setSelectedIndex = onSelectedIndexChange || setInternalSelectedIndex;

  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onIsOpenChange || setInternalIsOpen;
  const dropdownRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  // 입력값에 따라 필터링된 아이템 목록
  const filteredItems = useMemo(() => {
    if (!value || value.trim().length === 0) {
      return [];
    }

    const searchTerm = value.toLowerCase().trim();
    return items
      .filter((item) => item.name.toLowerCase().includes(searchTerm))
      .slice(0, 10); // 최대 10개만 표시
  }, [items, value]);

  // 필터링된 아이템이 변경되면 선택 인덱스 초기화 (외부 제어가 없을 때만)
  useEffect(() => {
    if (externalSelectedIndex === undefined) {
      setSelectedIndex(-1);
    }
  }, [filteredItems, externalSelectedIndex, setSelectedIndex]);

  // 드롭다운 표시 여부 결정 (외부 제어가 없을 때만)
  useEffect(() => {
    if (externalIsOpen === undefined) {
      setIsOpen(filteredItems.length > 0 && value.trim().length > 0);
    }
  }, [filteredItems, value, externalIsOpen, setIsOpen]);

  // 선택된 아이템으로 스크롤
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (selectedIndex < filteredItems.length - 1) {
          setSelectedIndex(selectedIndex + 1);
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (selectedIndex > 0) {
          setSelectedIndex(selectedIndex - 1);
        } else if (selectedIndex === 0 && onArrowUpFromFirst) {
          // 첫 번째 아이템에서 위 화살표 누르면 검색창으로 포커스 이동
          onArrowUpFromFirst();
          setSelectedIndex(-1);
        }
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelect = (item: ItemInfo) => {
    onSelect(item);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleMouseEnter = (index: number) => {
    setSelectedIndex(index);
  };

  if (!isOpen && !isLoading) {
    return null;
  }

  return (
    <div
      className="absolute top-full left-0 right-0 mt-2 z-50"
      onKeyDown={handleKeyDown}
    >
      <ul
        ref={dropdownRef}
        className="bg-white rounded-xl border border-gray-200 shadow-2xl max-h-80 overflow-y-auto"
        role="listbox"
      >
        {isLoading ? (
          <li className="px-4 py-3 text-sm text-gray-500 text-center">
            로딩 중...
          </li>
        ) : filteredItems.length === 0 ? (
          <li className="px-4 py-3 text-sm text-gray-500 text-center">
            검색 결과가 없습니다
          </li>
        ) : (
          filteredItems.map((item, index) => (
            <li
              key={`${item.name}-${index}`}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className={clsx(
                "px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0",
                selectedIndex === index
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-900 hover:bg-gray-50",
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(item);
              }}
              onMouseEnter={() => handleMouseEnter(index)}
              role="option"
              aria-selected={selectedIndex === index}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.topCategory} › {item.subCategory}
                  </div>
                </div>
                {selectedIndex === index && (
                  <svg
                    className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
