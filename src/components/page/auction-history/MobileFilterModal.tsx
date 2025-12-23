"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, RotateCcw, ArrowUp, ArrowDown } from "lucide-react";
import { useSearchOptions } from "@/hooks/useSearchOptions";
import {
  SearchOptionMetadata,
  FieldMetadata,
  ActiveFilter,
} from "@/types/search-filter";
import { ItemCategory } from "@/data/item-category";
import clsx from "clsx";

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterType: "category" | "price" | "date" | "options";
  initialData?: {
    selectedCategory?: string;
    priceMin?: string;
    priceMax?: string;
    dateFrom?: string;
    dateTo?: string;
    activeFilters?: ActiveFilter[];
  };
  categories?: ItemCategory[];
  onApply: (data: {
    selectedCategory?: string;
    priceMin?: string;
    priceMax?: string;
    dateFrom?: string;
    dateTo?: string;
    activeFilters?: ActiveFilter[];
  }) => void;
}

export default function MobileFilterModal({
  isOpen,
  onClose,
  filterType: initialFilterType,
  initialData,
  categories = [],
  onApply,
}: MobileFilterModalProps) {
  const { data: searchOptions = [] } = useSearchOptions();
  const [currentTab, setCurrentTab] = useState<"category" | "price" | "date" | "options">(initialFilterType);

  // Parse initialData.selectedCategory to extract top and sub category
  const parseSelectedCategory = (selected: string) => {
    if (!selected || selected === "all") {
      return { top: "all", sub: "all" };
    }
    const parts = selected.split("/");
    if (parts.length === 1) {
      return { top: parts[0], sub: "all" };
    }
    return { top: parts[0], sub: parts[1] };
  };

  const parsed = parseSelectedCategory(initialData?.selectedCategory || "all");
  const [selectedTopCategory, setSelectedTopCategory] = useState<string>(parsed.top);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(parsed.sub);

  const [priceMin, setPriceMin] = useState(initialData?.priceMin || "");
  const [priceMax, setPriceMax] = useState(initialData?.priceMax || "");
  const [dateFrom, setDateFrom] = useState(initialData?.dateFrom || "");
  const [dateTo, setDateTo] = useState(initialData?.dateTo || "");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>(
    initialData?.activeFilters || []
  );
  const [showAddFilterDropdown, setShowAddFilterDropdown] = useState(false);

  const handleReset = () => {
    if (currentTab === "category") {
      setSelectedTopCategory("all");
      setSelectedSubCategory("all");
    } else if (currentTab === "price") {
      setPriceMin("");
      setPriceMax("");
    } else if (currentTab === "date") {
      setDateFrom("");
      setDateTo("");
    } else {
      setActiveFilters([]);
    }
  };

  const handleApply = () => {
    if (currentTab === "category") {
      // Convert back to selectedCategory format
      let selectedCategory: string;
      if (selectedTopCategory === "all") {
        selectedCategory = "all";
      } else if (selectedSubCategory === "all") {
        selectedCategory = selectedTopCategory;
      } else {
        selectedCategory = `${selectedTopCategory}/${selectedSubCategory}`;
      }
      onApply({ selectedCategory });
    } else if (currentTab === "price") {
      onApply({ priceMin, priceMax });
    } else if (currentTab === "date") {
      onApply({ dateFrom, dateTo });
    } else {
      onApply({ activeFilters });
    }
    onClose();
  };

  const handleAddFilter = useCallback(
    (option: SearchOptionMetadata) => {
      const newFilter: ActiveFilter = {
        id: option.id,
        searchOptionName: option.searchOptionName,
        searchCondition: option.searchCondition,
        values: {},
      };
      setActiveFilters([...activeFilters, newFilter]);
      setShowAddFilterDropdown(false);
    },
    [activeFilters]
  );

  const handleRemoveFilter = useCallback(
    (filterId: number) => {
      setActiveFilters(activeFilters.filter((f) => f.id !== filterId));
    },
    [activeFilters]
  );

  const handleFilterValueChange = useCallback(
    (filterId: number, fieldName: string, value: string) => {
      setActiveFilters(
        activeFilters.map((filter) =>
          filter.id === filterId
            ? {
                ...filter,
                values: { ...filter.values, [fieldName]: value },
              }
            : filter
        )
      );
    },
    [activeFilters]
  );

  const analyzeFilterType = useCallback(
    (searchCondition: Record<string, FieldMetadata>) => {
      const fieldNames = Object.keys(searchCondition);
      const hasFromTo = fieldNames.some(
        (name) =>
          name.endsWith("From") &&
          fieldNames.includes(name.replace("From", "To"))
      );
      if (hasFromTo) return "range";

      const hasStandard = fieldNames.some((name) => name.endsWith("Standard"));
      if (hasStandard) return "valueWithStandard";

      const hasEnum = Object.values(searchCondition).some(
        (metadata) => metadata.allowedValues && metadata.allowedValues.length > 0
      );
      if (hasEnum) return "enum";

      return "text";
    },
    []
  );

  const renderFilterInputs = useCallback(
    (filter: ActiveFilter) => {
      const type = analyzeFilterType(filter.searchCondition);

      if (type === "range") {
        const fieldNames = Object.keys(filter.searchCondition);
        const fromField = fieldNames.find((name) => name.endsWith("From"));
        const toField = fromField?.replace("From", "To");

        if (!fromField || !toField) return null;

        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="최소"
              value={filter.values[fromField] || ""}
              onChange={(e) =>
                handleFilterValueChange(filter.id, fromField, e.target.value)
              }
              className="h-10 rounded-lg text-sm"
            />
            <span className="text-gray-400 text-sm">~</span>
            <Input
              type="number"
              placeholder="최대"
              value={filter.values[toField] || ""}
              onChange={(e) =>
                handleFilterValueChange(filter.id, toField, e.target.value)
              }
              className="h-10 rounded-lg text-sm"
            />
          </div>
        );
      }

      if (type === "valueWithStandard") {
        const fieldNames = Object.keys(filter.searchCondition);
        const valueField = fieldNames.find((name) => !name.endsWith("Standard"));
        const standardField = fieldNames.find((name) =>
          name.endsWith("Standard")
        );

        if (!valueField || !standardField) return null;

        const currentStandard = (filter.values[standardField] as string) || "UP";
        const isUp = currentStandard === "UP";

        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="값 입력"
              value={filter.values[valueField] || ""}
              onChange={(e) =>
                handleFilterValueChange(filter.id, valueField, e.target.value)
              }
              className="h-10 rounded-lg text-sm flex-1"
            />
            <button
              onClick={() =>
                handleFilterValueChange(
                  filter.id,
                  standardField,
                  isUp ? "DOWN" : "UP"
                )
              }
              className="h-10 w-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              {isUp ? (
                <ArrowUp className="w-5 h-5 text-blue-600" />
              ) : (
                <ArrowDown className="w-5 h-5 text-purple-600" />
              )}
            </button>
          </div>
        );
      }

      if (type === "enum") {
        const fieldNames = Object.keys(filter.searchCondition);
        const enumField = fieldNames.find(
          (name) => filter.searchCondition[name].allowedValues
        );

        if (!enumField) return null;

        const enumMetadata = filter.searchCondition[enumField];

        return (
          <Select
            value={filter.values[enumField] as string}
            onValueChange={(value) =>
              handleFilterValueChange(filter.id, enumField, value)
            }
          >
            <SelectTrigger className="h-10 rounded-lg text-sm">
              <SelectValue placeholder="선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {enumMetadata.allowedValues?.map((val) => (
                <SelectItem key={val} value={val}>
                  {val}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      const fieldName = Object.keys(filter.searchCondition)[0];
      return (
        <Input
          type="text"
          placeholder="값 입력"
          value={filter.values[fieldName] || ""}
          onChange={(e) =>
            handleFilterValueChange(filter.id, fieldName, e.target.value)
          }
          className="h-10 rounded-lg text-sm"
        />
      );
    },
    [analyzeFilterType, handleFilterValueChange]
  );

  const availableOptions = searchOptions.filter(
    (opt) => !activeFilters.some((f) => f.id === opt.id)
  );

  if (!isOpen) return null;

  const tabs = [
    { id: "category" as const, label: "카테고리", icon: "📁" },
    { id: "price" as const, label: "금액", icon: "💰" },
    { id: "date" as const, label: "날짜", icon: "📅" },
    { id: "options" as const, label: "옵션", icon: "⚙️" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col animate-slide-up pb-16">
        {/* Header with Close Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">필터</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 py-3 overflow-x-auto border-b border-gray-200 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                currentTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {currentTab === "category" && (
            <div className="grid grid-cols-2 gap-3 h-full">
              {/* 왼쪽: 상위 카테고리 */}
              <div className="space-y-1 border-r border-gray-200 pr-3">
                <h4 className="text-xs font-semibold text-gray-500 mb-2 px-2">상위 카테고리</h4>
                {/* 전체 옵션 */}
                <button
                  onClick={() => {
                    setSelectedTopCategory("all");
                    setSelectedSubCategory("all");
                  }}
                  className={clsx(
                    "w-full px-3 py-2 rounded-lg text-sm text-left transition-colors",
                    selectedTopCategory === "all"
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  전체
                </button>
                {/* topCategory 리스트 (전체 제외) */}
                {categories.filter((cat) => cat.id !== "all").map((category) => {
                  const isSelected = selectedTopCategory === category.id;

                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedTopCategory(category.id);
                        setSelectedSubCategory("all");
                      }}
                      className={clsx(
                        "w-full px-3 py-2 rounded-lg text-sm text-left transition-colors",
                        isSelected
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>

              {/* 오른쪽: 하위 카테고리 */}
              <div className="space-y-1 pl-3">
                <h4 className="text-xs font-semibold text-gray-500 mb-2 px-2">하위 카테고리</h4>
                {selectedTopCategory !== "all" ? (
                  <>
                    {/* 전체 옵션 */}
                    <button
                      onClick={() => setSelectedSubCategory("all")}
                      className={clsx(
                        "w-full px-3 py-2 rounded-lg text-sm text-left transition-colors",
                        selectedSubCategory === "all"
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      전체
                    </button>
                    {/* subCategory 리스트 */}
                    {categories
                      .find((cat) => cat.id === selectedTopCategory)
                      ?.children?.map((subCategory) => {
                        const isSelected = selectedSubCategory === subCategory.id;

                        return (
                          <button
                            key={subCategory.id}
                            onClick={() => setSelectedSubCategory(subCategory.id)}
                            className={clsx(
                              "w-full px-3 py-2 rounded-lg text-sm text-left transition-colors",
                              isSelected
                                ? "bg-blue-50 text-blue-700 font-semibold"
                                : "text-gray-700 hover:bg-gray-100"
                            )}
                          >
                            {subCategory.name}
                          </button>
                        );
                      })}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    왼쪽에서 상위 카테고리를 선택하세요
                  </div>
                )}
              </div>
            </div>
          )}

          {currentTab === "price" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  최소 금액 (골드)
                </label>
                <Input
                  type="number"
                  placeholder="최소 금액 입력"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="h-12 rounded-xl text-base"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  최대 금액 (골드)
                </label>
                <Input
                  type="number"
                  placeholder="최대 금액 입력"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="h-12 rounded-xl text-base"
                />
              </div>
            </div>
          )}

          {currentTab === "date" && (
            <div className="space-y-4">
              {/* 날짜 입력 - 한 줄 배치 */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  기간 선택
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-12 rounded-xl text-base flex-1"
                    placeholder="시작일"
                  />
                  <span className="text-gray-400">~</span>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-12 rounded-xl text-base flex-1"
                    placeholder="종료일"
                  />
                </div>
              </div>

              {/* 빠른 선택 버튼 */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  빠른 선택
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      const today = new Date();
                      const todayStr = today.toISOString().split('T')[0];
                      setDateFrom(todayStr);
                      setDateTo(todayStr);
                    }}
                    className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                  >
                    오늘
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const weekAgo = new Date(today);
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      setDateFrom(weekAgo.toISOString().split('T')[0]);
                      setDateTo(today.toISOString().split('T')[0]);
                    }}
                    className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                  >
                    최근 일주일
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const monthAgo = new Date(today);
                      monthAgo.setDate(monthAgo.getDate() - 30);
                      setDateFrom(monthAgo.toISOString().split('T')[0]);
                      setDateTo(today.toISOString().split('T')[0]);
                    }}
                    className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                  >
                    최근 한달
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentTab === "options" && (
            <div className="space-y-3">
              {/* Add Filter Button */}
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowAddFilterDropdown(!showAddFilterDropdown)}
                  className="w-full h-12 rounded-xl flex items-center justify-center gap-2"
                  disabled={availableOptions.length === 0}
                >
                  <Plus className="w-5 h-5" />
                  필터 추가
                </Button>

                {showAddFilterDropdown && availableOptions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 max-h-60 overflow-auto z-50">
                    {availableOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleAddFilter(option)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        {option.searchOptionName}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Filters */}
              {activeFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="bg-gray-50 rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">
                      {filter.searchOptionName}
                    </h4>
                    <button
                      onClick={() => handleRemoveFilter(filter.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {renderFilterInputs(filter)}
                </div>
              ))}

              {activeFilters.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  추가된 옵션 필터가 없습니다
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-white">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1 h-12 rounded-xl font-semibold"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              초기화
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
            >
              적용하기
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
