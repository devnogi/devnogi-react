"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ItemCategory } from "@/data/item-category";
import React, { useRef, useState } from "react";
import { useItemInfos, ItemInfo } from "@/hooks/useItemInfos";
import Autocomplete from "@/components/commons/Autocomplete";

export default function SearchSection({
  path,
  onCategorySelect,
  itemName,
  setItemName,
}: {
  path: ItemCategory[];
  onCategorySelect: (categoryId: string) => void;
  itemName: string;
  setItemName: (name: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: itemInfos = [], isLoading } = useItemInfos();
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleItemSelect = (item: ItemInfo) => {
    // 아이템 이름 설정
    setItemName(item.name);

    // 해당 아이템의 카테고리를 찾아서 선택
    // 카테고리 ID 형식: "상위카테고리/하위카테고리"
    const categoryId = `${item.topCategory}/${item.subCategory}`;
    onCategorySelect(categoryId);

    // 입력창 포커스 해제
    inputRef.current?.blur();
    setSelectedIndex(-1);
  };

  const handleReset = () => {
    setItemName("");
    onCategorySelect("all");
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 검색창에서 아래 화살표를 누르면 자동완성의 첫 번째 아이템으로 이동
    if (e.key === "ArrowDown" && itemName.trim().length > 0) {
      e.preventDefault();
      setSelectedIndex(0);
    }
  };

  const handleArrowUpFromFirst = () => {
    // 자동완성 첫 번째 아이템에서 위 화살표를 누르면 검색창으로 포커스 이동
    inputRef.current?.focus();
    setSelectedIndex(-1);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
      {/* Breadcrumb */}
      {path.length > 0 && (
        <div className="flex items-center gap-2 mb-4 text-sm flex-wrap">
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
            onChange={(e) => setItemName(e.target.value)}
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
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        <Button className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all">
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
