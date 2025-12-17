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

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterType: "price" | "date" | "options";
  initialData?: {
    priceMin?: string;
    priceMax?: string;
    dateFrom?: string;
    dateTo?: string;
    activeFilters?: ActiveFilter[];
  };
  onApply: (data: {
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
  filterType,
  initialData,
  onApply,
}: MobileFilterModalProps) {
  const { data: searchOptions = [] } = useSearchOptions();
  const [priceMin, setPriceMin] = useState(initialData?.priceMin || "");
  const [priceMax, setPriceMax] = useState(initialData?.priceMax || "");
  const [dateFrom, setDateFrom] = useState(initialData?.dateFrom || "");
  const [dateTo, setDateTo] = useState(initialData?.dateTo || "");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>(
    initialData?.activeFilters || []
  );
  const [showAddFilterDropdown, setShowAddFilterDropdown] = useState(false);

  const handleReset = () => {
    if (filterType === "price") {
      setPriceMin("");
      setPriceMax("");
    } else if (filterType === "date") {
      setDateFrom("");
      setDateTo("");
    } else {
      setActiveFilters([]);
    }
  };

  const handleApply = () => {
    if (filterType === "price") {
      onApply({ priceMin, priceMax });
    } else if (filterType === "date") {
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

  const titles = {
    price: "💰 금액 필터",
    date: "📅 날짜 필터",
    options: "⚙️ 옵션 필터",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col animate-slide-up pb-16">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">{titles[filterType]}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filterType === "price" && (
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

          {filterType === "date" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  시작 날짜
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-12 rounded-xl text-base"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  종료 날짜
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-12 rounded-xl text-base"
                />
              </div>
            </div>
          )}

          {filterType === "options" && (
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
