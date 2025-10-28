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
import { useSearchOptions } from "@/hooks/useSearchOptions";
import {
  SearchOptionMetadata,
  FieldMetadata,
  FilterValue,
  ActiveFilter,
} from "@/types/search-filter";
import { Plus, X, Search, RotateCcw } from "lucide-react";

interface SearchFilterCardProps {
  onFilterApply: (filters: Record<string, string | number>) => void;
}

interface BasicFilters {
  priceMin: string;
  priceMax: string;
  dateFrom: string;
  dateTo: string;
}

export default function SearchFilterCard({
  onFilterApply,
}: SearchFilterCardProps) {
  const { data: searchOptions = [], isLoading } = useSearchOptions();
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [basicFilters, setBasicFilters] = useState<BasicFilters>({
    priceMin: "",
    priceMax: "",
    dateFrom: "",
    dateTo: "",
  });
  const [showAddFilterDropdown, setShowAddFilterDropdown] = useState(false);

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
    [activeFilters],
  );

  const handleRemoveFilter = useCallback(
    (filterId: number) => {
      setActiveFilters(activeFilters.filter((f) => f.id !== filterId));
    },
    [activeFilters],
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
            : filter,
        ),
      );
    },
    [activeFilters],
  );

  const handleReset = useCallback(() => {
    setBasicFilters({
      priceMin: "",
      priceMax: "",
      dateFrom: "",
      dateTo: "",
    });
    setActiveFilters([]);
  }, []);

  const handleApply = useCallback(() => {
    const allFilters: Record<string, string | number> = {};

    // Add basic filters
    if (basicFilters.priceMin)
      allFilters.priceMin = Number(basicFilters.priceMin);
    if (basicFilters.priceMax)
      allFilters.priceMax = Number(basicFilters.priceMax);
    if (basicFilters.dateFrom) allFilters.dateFrom = basicFilters.dateFrom;
    if (basicFilters.dateTo) allFilters.dateTo = basicFilters.dateTo;

    // Add dynamic filters
    activeFilters.forEach((filter) => {
      Object.entries(filter.values).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          allFilters[key] = value;
        }
      });
    });

    onFilterApply(allFilters);
  }, [basicFilters, activeFilters, onFilterApply]);

  const analyzeFilterType = useCallback(
    (searchCondition: Record<string, FieldMetadata>) => {
      const fieldNames = Object.keys(searchCondition);

      // Check for range filter (From/To)
      const hasFromTo = fieldNames.some(
        (name) =>
          name.endsWith("From") &&
          fieldNames.includes(name.replace("From", "To")),
      );
      if (hasFromTo) return "range";

      // Check for value + standard
      const hasStandard = fieldNames.some((name) => name.endsWith("Standard"));
      if (hasStandard) return "valueWithStandard";

      // Check for enum
      const hasEnum = Object.values(searchCondition).some(
        (metadata) => metadata.allowedValues && metadata.allowedValues.length > 0,
      );
      if (hasEnum) return "enum";

      return "text";
    },
    [],
  );

  const renderFilterInputs = useCallback(
    (filter: ActiveFilter) => {
      const type = analyzeFilterType(filter.searchCondition);

      if (type === "range") {
        // Find From/To pair
        const fieldNames = Object.keys(filter.searchCondition);
        const fromField = fieldNames.find((name) => name.endsWith("From"));
        const toField = fromField?.replace("From", "To");

        if (!fromField || !toField) return null;

        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="최소"
                value={filter.values[fromField] || ""}
                onChange={(e) =>
                  handleFilterValueChange(filter.id, fromField, e.target.value)
                }
                className="h-10 rounded-lg"
              />
              <span className="text-gray-400">~</span>
              <Input
                type="number"
                placeholder="최대"
                value={filter.values[toField] || ""}
                onChange={(e) =>
                  handleFilterValueChange(filter.id, toField, e.target.value)
                }
                className="h-10 rounded-lg"
              />
            </div>
          </div>
        );
      }

      if (type === "valueWithStandard") {
        const fieldNames = Object.keys(filter.searchCondition);
        const valueField = fieldNames.find((name) => !name.endsWith("Standard"));
        const standardField = fieldNames.find((name) =>
          name.endsWith("Standard"),
        );

        if (!valueField || !standardField) return null;

        const standardMetadata = filter.searchCondition[standardField];

        return (
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="값 입력"
              value={filter.values[valueField] || ""}
              onChange={(e) =>
                handleFilterValueChange(filter.id, valueField, e.target.value)
              }
              className="h-10 rounded-lg"
            />
            <Select
              value={filter.values[standardField] as string}
              onValueChange={(value) =>
                handleFilterValueChange(filter.id, standardField, value)
              }
            >
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue placeholder="기준 선택" />
              </SelectTrigger>
              <SelectContent>
                {standardMetadata.allowedValues?.map((val) => (
                  <SelectItem key={val} value={val}>
                    {val}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      }

      if (type === "enum") {
        const fieldNames = Object.keys(filter.searchCondition);
        const enumField = fieldNames.find(
          (name) => filter.searchCondition[name].allowedValues,
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
            <SelectTrigger className="h-10 rounded-lg">
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

      // Default: text input
      const fieldName = Object.keys(filter.searchCondition)[0];
      return (
        <Input
          type="text"
          placeholder="값 입력"
          value={filter.values[fieldName] || ""}
          onChange={(e) =>
            handleFilterValueChange(filter.id, fieldName, e.target.value)
          }
          className="h-10 rounded-lg"
        />
      );
    },
    [analyzeFilterType, handleFilterValueChange],
  );

  const availableOptions = searchOptions.filter(
    (opt) => !activeFilters.some((f) => f.id === opt.id),
  );

  if (isLoading) {
    return (
      <div className="fixed right-24 top-32 bottom-8 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 p-6 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="fixed right-24 top-32 bottom-8 w-80 overflow-auto">
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Search className="w-5 h-5" />
            검색 필터
          </h2>
        </div>

        {/* Price Filter */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            💰 금액 (골드)
          </h3>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="최소"
              value={basicFilters.priceMin}
              onChange={(e) =>
                setBasicFilters({ ...basicFilters, priceMin: e.target.value })
              }
              className="h-10 rounded-lg"
            />
            <span className="text-gray-400">~</span>
            <Input
              type="number"
              placeholder="최대"
              value={basicFilters.priceMax}
              onChange={(e) =>
                setBasicFilters({ ...basicFilters, priceMax: e.target.value })
              }
              className="h-10 rounded-lg"
            />
          </div>
        </div>

        {/* Date Filter */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            📅 거래 일자
          </h3>
          <div className="space-y-2">
            <Input
              type="date"
              value={basicFilters.dateFrom}
              onChange={(e) =>
                setBasicFilters({ ...basicFilters, dateFrom: e.target.value })
              }
              className="h-10 rounded-lg"
            />
            <Input
              type="date"
              value={basicFilters.dateTo}
              onChange={(e) =>
                setBasicFilters({ ...basicFilters, dateTo: e.target.value })
              }
              className="h-10 rounded-lg"
            />
          </div>
        </div>

        {/* Add Filter Button */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowAddFilterDropdown(!showAddFilterDropdown)}
              className="w-full h-10 rounded-lg flex items-center justify-center gap-2"
              disabled={availableOptions.length === 0}
            >
              <Plus className="w-4 h-4" />
              필터 추가
            </Button>

            {showAddFilterDropdown && availableOptions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-64 overflow-auto z-50">
                {availableOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAddFilter(option)}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors"
                  >
                    {option.searchOptionName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.map((filter) => (
          <div
            key={filter.id}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">
                {filter.searchOptionName}
              </h3>
              <button
                onClick={() => handleRemoveFilter(filter.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {renderFilterInputs(filter)}
          </div>
        ))}

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1 h-10 rounded-lg flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              초기화
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            >
              검색 적용
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
