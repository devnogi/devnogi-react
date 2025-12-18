"use client";

import { Input } from "@/components/ui/input";
import { ArrowLeft, XCircle } from "lucide-react";
import { useItemInfos, ItemInfo } from "@/hooks/useItemInfos";
import { useState, useRef, useEffect, useMemo } from "react";

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  setItemName: (name: string) => void;
  onSearch: (overrides?: { itemName?: string; categoryId?: string }) => void;
  onCategorySelect: (categoryId: string) => void;
}

// 최근 검색어 관리
const RECENT_SEARCHES_KEY = "auction_recent_searches";
const MAX_RECENT_SEARCHES = 10;

const getRecentSearches = (): string[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
  return stored ? JSON.parse(stored) : [];
};

const addRecentSearch = (searchTerm: string) => {
  if (!searchTerm.trim()) return;
  const searches = getRecentSearches();
  const filtered = searches.filter((s) => s !== searchTerm);
  const updated = [searchTerm, ...filtered].slice(0, MAX_RECENT_SEARCHES);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
};

const clearRecentSearches = () => {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
};

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
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // 모달이 열릴 때 입력창에 포커스 및 최근 검색어 로드
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setRecentSearches(getRecentSearches());
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

    // 최근 검색어에 추가
    addRecentSearch(item.name);

    // 해당 아이템의 카테고리를 찾아서 선택
    const categoryId = `${item.topCategory}/${item.subCategory}`;
    onCategorySelect(categoryId);

    // 검색 실행 - 클릭한 아이템 이름과 카테고리 정보로 검색
    setTimeout(() => {
      onSearch({ itemName: item.name, categoryId });
      onClose();
    }, 100);
  };

  const handleRecentSearchClick = (searchTerm: string) => {
    setItemName(searchTerm);
    addRecentSearch(searchTerm);
    onSearch({ itemName: searchTerm });
    onClose();
  };

  const handleClearAllRecentSearches = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const handleClearInput = () => {
    setItemName("");
    inputRef.current?.focus();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Search Input Header - No border, no card, seamless */}
      <div className="px-4 py-4 flex items-center gap-3">
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-700 hover:text-gray-900 transition-colors"
          aria-label="닫기"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            placeholder="아이템 이름을 입력하세요"
            className="h-12 pr-10 border-0 shadow-none focus-visible:ring-0 text-base bg-transparent"
            value={itemName}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            autoComplete="off"
          />
          {itemName.trim().length > 0 && (
            <button
              onClick={handleClearInput}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="입력 내용 지우기"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">

        {/* Autocomplete List - 텍스트 입력 시 */}
        {itemName.trim().length > 0 ? (
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
                    key={`${item.topCategory}-${item.subCategory}-${item.name}`}
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
        ) : (
          /* 최근 검색어 - 인풋창이 비어있을 때 */
          <div className="px-4">
            {recentSearches.length > 0 && (
              <>
                {/* 최근 검색어 헤더 */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-900">
                    최근 검색어
                  </span>
                  <button
                    onClick={handleClearAllRecentSearches}
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    전체삭제
                  </button>
                </div>

                {/* 최근 검색어 목록 */}
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={`${search}-${index}`}
                      onClick={() => handleRecentSearchClick(search)}
                      className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
