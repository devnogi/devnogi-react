"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ItemCategory } from "@/data/item-category";
import React, { useRef, useState, useMemo } from "react";
import { useItemInfos, ItemInfo } from "@/hooks/useItemInfos";
import Autocomplete from "@/components/commons/Autocomplete";
import { Menu } from "lucide-react";

export default function SearchSection({
  path,
  onCategorySelect,
  itemName,
  setItemName,
  onSearch,
  onCategoryMenuClick,
}: {
  path: ItemCategory[];
  onCategorySelect: (categoryId: string) => void;
  itemName: string;
  setItemName: (name: string) => void;
  onSearch?: (overrides?: { itemName?: string; categoryId?: string }) => void;
  onCategoryMenuClick?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: itemInfos = [], isLoading } = useItemInfos();
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);

  // 입력값에 따라 필터링된 아이템 목록 (Autocomplete와 동일한 로직)
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
    // 카테고리 ID 형식: "상위카테고리/하위카테고리"
    const categoryId = `${item.topCategory}/${item.subCategory}`;
    onCategorySelect(categoryId);

    // 자동완성 닫기
    setIsAutocompleteOpen(false);
    setSelectedIndex(-1);

    // 입력창 포커스 해제
    inputRef.current?.blur();

    // 검색 실행 - 선택한 아이템 이름과 카테고리 정보로 검색
    onSearch?.({ itemName: item.name, categoryId });
  };

  const handleReset = () => {
    setItemName("");
    onCategorySelect("all");
    setSelectedIndex(-1);
    setIsAutocompleteOpen(false);
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
        onSearch?.();
        setIsAutocompleteOpen(false);
      }
      return;
    }

    if (itemName.trim().length === 0) return;

    // 아래 화살표: 자동완성의 첫 번째 아이템으로 이동 또는 다음 아이템 선택
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
    // Escape: 자동완성 닫기
    else if (e.key === "Escape") {
      e.preventDefault();
      setSelectedIndex(-1);
      setIsAutocompleteOpen(false);
    }
  };

  const handleArrowUpFromFirst = () => {
    // 자동완성 첫 번째 아이템에서 위 화살표를 누르면 검색창으로 포커스 이동
    inputRef.current?.focus();
    setSelectedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setItemName(newValue);

    // 텍스트가 있으면 자동완성 열기
    if (newValue.trim().length > 0) {
      setIsAutocompleteOpen(true);
    } else {
      setIsAutocompleteOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
      {/* Breadcrumb */}
      {path.length > 0 && (
        <div className="flex items-center gap-2 mb-4 text-sm flex-wrap">
          {/* Category Menu Button - Hidden on 2xl+ screens (1536px+) */}
          {onCategoryMenuClick && (
            <button
              onClick={onCategoryMenuClick}
              className="2xl:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="카테고리 메뉴 열기"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          )}
          {path.map((p, index) => (
            <React.Fragment key={p.id}>
              {index > 0 && <span className="text-gray-400">›</span>}
              <Badge
                className="rounded-lg cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 font-medium"
                onClick={() => onCategorySelect(p.id)}
              >
                {p.name}
              </Badge>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Label
            htmlFor="item-search"
            className="text-sm font-semibold text-gray-700 mb-2 block"
          >
            아이템 검색
          </Label>
          <Input
            ref={inputRef}
            id="item-search"
            type="text"
            placeholder="아이템 이름을 입력하세요"
            className="h-12 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            value={itemName}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            autoComplete="off"
          />
          <Autocomplete
            items={itemInfos}
            value={itemName}
            onSelect={handleItemSelect}
            isLoading={isLoading}
            onArrowUpFromFirst={handleArrowUpFromFirst}
            externalSelectedIndex={selectedIndex}
            onSelectedIndexChange={setSelectedIndex}
            externalIsOpen={isAutocompleteOpen}
            onIsOpenChange={setIsAutocompleteOpen}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        <Button
          className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
          onClick={() => onSearch?.()}
        >
          찾기
        </Button>
        <Button
          variant="outline"
          className="h-12 px-6 rounded-xl border-gray-300 hover:bg-gray-50 transition-all"
          onClick={handleReset}
        >
          초기화
        </Button>
      </div>
    </div>
  );
}
