"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";
import { useItemInfos, ItemInfo } from "@/hooks/useItemInfos";
import { useState, useRef, useEffect, useMemo } from "react";

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  setItemName: (name: string) => void;
  onSearch: () => void;
  onCategorySelect: (categoryId: string) => void;
}

export default function MobileSearchModal({
  isOpen,
  onClose,
  itemName,
  setItemName,
  onSearch,
  onCategorySelect,
}: MobileSearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: itemInfos = [], isLoading } = useItemInfos();
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // 모달이 열릴 때 입력창에 포커스
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // 입력값에 따라 필터링된 아이템 목록
  const filteredItems = useMemo(() => {
    if (!itemName || itemName.trim().length === 0) {
      return [];
    }

    const searchTerm = itemName.toLowerCase().trim();
    return itemInfos
      .filter((item) => item.name.toLowerCase().includes(searchTerm))
      .slice(0, 10);
  }, [itemInfos, itemName]);

  const handleItemSelect = (item: ItemInfo) => {
    // 아이템 이름 설정
    setItemName(item.name);

    // 해당 아이템의 카테고리를 찾아서 선택
    const categoryId = `${item.topCategory}/${item.subCategory}`;
    onCategorySelect(categoryId);

    // 검색 실행
    setTimeout(() => {
      onSearch();
      onClose();
    }, 100);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 엔터키: 선택된 항목이 있으면 자동완성, 없으면 검색 실행
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredItems[selectedIndex]) {
        handleItemSelect(filteredItems[selectedIndex]);
      } else {
        // 선택된 항목이 없으면 검색 실행
        onSearch();
        onClose();
      }
      return;
    }

    if (itemName.trim().length === 0) return;

    // 아래 화살표: 다음 아이템 선택
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (selectedIndex < filteredItems.length - 1) {
        setSelectedIndex(selectedIndex + 1);
      }
    }
    // 위 화살표: 이전 아이템 선택
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1);
      } else if (selectedIndex === 0) {
        setSelectedIndex(-1);
      }
    }
    // Escape: 모달 닫기
    else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setItemName(e.target.value);
    setSelectedIndex(-1);
  };

  const handleSearchClick = () => {
    onSearch();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onClose}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="닫기"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">아이템 검색</h2>
      </div>

      {/* Search Input */}
      <div className="p-4">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <Input
            ref={inputRef}
            type="text"
            placeholder="아이템 이름을 입력하세요"
            className="h-12 pl-11 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-base"
            value={itemName}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            autoComplete="off"
          />
        </div>

        {/* Search Button */}
        <Button
          className="w-full h-12 mt-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
          onClick={handleSearchClick}
        >
          검색
        </Button>
      </div>

      {/* Autocomplete List */}
      {itemName.trim().length > 0 && (
        <div className="px-4">
          {isLoading ? (
            <div className="py-8 text-center text-gray-500 text-sm">
              로딩 중...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm">
              검색 결과가 없습니다
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-xs text-gray-500 mb-2 px-2">
                {filteredItems.length}개의 아이템
              </div>
              {filteredItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleItemSelect(item)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedIndex === index
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-gray-50 text-gray-900"
                  }`}
                >
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.topCategory} › {item.subCategory}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {itemName.trim().length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <Search className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-center">
            아이템 이름을 입력하여
            <br />
            경매장 거래 내역을 검색해보세요
          </p>
        </div>
      )}
    </div>
  );
}
