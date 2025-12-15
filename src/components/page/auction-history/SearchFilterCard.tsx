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
  ActiveFilter,
} from "@/types/search-filter";
import { AuctionHistorySearchParams } from "@/types/auction-history";
import { Plus, X, RotateCcw, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from "lucide-react";

interface SearchFilterCardProps {
  onFilterApply: (filters: AuctionHistorySearchParams) => void;
  isModal?: boolean;
  onClose?: () => void;
}

interface BasicFilters {
  priceMin: string;
  priceMax: string;
  dateFrom: string;
  dateTo: string;
}

export default function SearchFilterCard({
  onFilterApply,
  isModal = false,
  onClose,
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
  const [isDateCollapsed, setIsDateCollapsed] = useState(false);

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
    const searchParams: AuctionHistorySearchParams = {};

    // Build price search request
    if (basicFilters.priceMin || basicFilters.priceMax) {
      searchParams.priceSearchRequest = {};
      if (basicFilters.priceMin) {
        searchParams.priceSearchRequest.priceFrom = Number(basicFilters.priceMin);
      }
      if (basicFilters.priceMax) {
        searchParams.priceSearchRequest.priceTo = Number(basicFilters.priceMax);
      }
    }

    // Build date auction buy request
    if (basicFilters.dateFrom || basicFilters.dateTo) {
      searchParams.dateAuctionBuyRequest = {};
      if (basicFilters.dateFrom) {
        searchParams.dateAuctionBuyRequest.dateAuctionBuyFrom = basicFilters.dateFrom;
      }
      if (basicFilters.dateTo) {
        searchParams.dateAuctionBuyRequest.dateAuctionBuyTo = basicFilters.dateTo;
      }
    }

    // Build item option search request from dynamic filters
    if (activeFilters.length > 0) {
      searchParams.itemOptionSearchRequest = {};

      activeFilters.forEach((filter) => {
        // Map filter values to nested structure
        // searchCondition의 key로부터 옵션 타입을 추출
        const conditionKeys = Object.keys(filter.searchCondition);

        // 각 필터는 하나의 옵션 타입을 가짐 (예: balanceSearch, criticalSearch 등)
        // filter.values에는 실제 값들이 있음
        Object.entries(filter.values).forEach(([key, value]) => {
          if (value === undefined || value === "") return;

          // 옵션 타입 결정 (예: balanceSearch)
          let optionSearchKey: string;
          if (key.endsWith("From") || key.endsWith("To")) {
            // Range search (예: ergFrom/ergTo -> ergSearch)
            const baseName = key.replace(/(From|To)$/, "");
            optionSearchKey = `${baseName}Search`;
          } else if (key.endsWith("Standard")) {
            // Value with standard (예: balanceStandard -> balanceSearch)
            const baseName = key.replace(/Standard$/, "");
            optionSearchKey = `${baseName}Search`;
          } else if (key === "wearingRestrictions") {
            optionSearchKey = "wearingRestrictionsSearch";
          } else if (key === "ergRank") {
            optionSearchKey = "ergRankSearch";
          } else {
            // Default: add "Search" suffix
            optionSearchKey = `${key}Search`;
          }

          // Initialize nested object if not exists
          if (!searchParams.itemOptionSearchRequest![optionSearchKey as keyof typeof searchParams.itemOptionSearchRequest]) {
            (searchParams.itemOptionSearchRequest as Record<string, Record<string, unknown>>)[optionSearchKey] = {};
          }

          // Set the value
          (searchParams.itemOptionSearchRequest as Record<string, Record<string, unknown>>)[optionSearchKey][key] = value;
        });
      });
    }

    onFilterApply(searchParams);
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
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="최소"
              value={filter.values[fromField] || ""}
              onChange={(e) =>
                handleFilterValueChange(filter.id, fromField, e.target.value)
              }
              className="h-9 rounded-lg text-sm"
            />
            <span className="text-gray-400 text-sm">~</span>
            <Input
              type="number"
              placeholder="최대"
              value={filter.values[toField] || ""}
              onChange={(e) =>
                handleFilterValueChange(filter.id, toField, e.target.value)
              }
              className="h-9 rounded-lg text-sm"
            />
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
              className="h-9 rounded-lg text-sm flex-1"
            />
            <button
              onClick={() =>
                handleFilterValueChange(
                  filter.id,
                  standardField,
                  isUp ? "DOWN" : "UP",
                )
              }
              className="h-9 w-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
              title={isUp ? "이상 (클릭하면 이하)" : "이하 (클릭하면 이상)"}
            >
              {isUp ? (
                <ArrowUp className="w-4 h-4 text-blue-600" />
              ) : (
                <ArrowDown className="w-4 h-4 text-purple-600" />
              )}
            </button>
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
            <SelectTrigger className="h-9 rounded-lg text-sm">
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
          className="h-9 rounded-lg text-sm"
        />
      );
    },
    [analyzeFilterType, handleFilterValueChange],
  );

  const availableOptions = searchOptions.filter(
    (opt) => !activeFilters.some((f) => f.id === opt.id),
  );

  if (isLoading) {
    const loadingContent = (
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 flex items-center justify-center">
        <div className="text-gray-500 text-sm">로딩 중...</div>
      </div>
    );

    if (isModal) {
      return (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
          <div className="fixed inset-x-4 top-20 bottom-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-96 md:top-24 md:bottom-24 z-50">
            {loadingContent}
          </div>
        </>
      );
    }

    return (
      <div className="fixed right-24 top-32 bottom-8 w-72">
        {loadingContent}
      </div>
    );
  }

  const filterContent = (
    <div className="space-y-3">
      {/* Header - Compact */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 py-3 px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">
            검색 필터
          </h2>
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Price & Date Combined Filter */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        {/* Price Section */}
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
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
              className="h-9 rounded-lg text-sm"
            />
            <span className="text-gray-400 text-sm">~</span>
            <Input
              type="number"
              placeholder="최대"
              value={basicFilters.priceMax}
              onChange={(e) =>
                setBasicFilters({ ...basicFilters, priceMax: e.target.value })
              }
              className="h-9 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Date Section - Collapsible */}
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">
              📅 거래 일자
            </h3>
            <button
              onClick={() => setIsDateCollapsed(!isDateCollapsed)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isDateCollapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>

          {!isDateCollapsed ? (
            <div className="space-y-2">
              <Input
                type="date"
                value={basicFilters.dateFrom}
                onChange={(e) =>
                  setBasicFilters({ ...basicFilters, dateFrom: e.target.value })
                }
                className="h-9 rounded-lg text-sm"
              />
              <Input
                type="date"
                value={basicFilters.dateTo}
                onChange={(e) =>
                  setBasicFilters({ ...basicFilters, dateTo: e.target.value })
                }
                className="h-9 rounded-lg text-sm"
              />
            </div>
          ) : (
            <div className="text-xs text-gray-500 mt-1">
              {basicFilters.dateFrom || basicFilters.dateTo ? (
                <div className="flex items-center gap-1">
                  <span>{basicFilters.dateFrom || "시작일"}</span>
                  <span>~</span>
                  <span>{basicFilters.dateTo || "종료일"}</span>
                </div>
              ) : (
                <span className="text-gray-400">일자 미선택</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Filter Button */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowAddFilterDropdown(!showAddFilterDropdown)}
            className="w-full h-9 rounded-lg flex items-center justify-center gap-2 text-sm"
            disabled={availableOptions.length === 0}
          >
            <Plus className="w-4 h-4" />
            필터 추가
          </Button>

          {showAddFilterDropdown && availableOptions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-56 overflow-auto z-50">
              {availableOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAddFilter(option)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
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
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
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
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 h-9 rounded-lg flex items-center justify-center gap-1.5 text-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            초기화
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 h-9 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 text-sm"
          >
            검색 적용
          </Button>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Modal */}
        <div className="fixed inset-x-4 top-20 bottom-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-96 md:top-24 md:bottom-24 z-50 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {filterContent}
        </div>
      </>
    );
  }

  return (
    <div className="fixed right-24 top-32 bottom-8 w-72 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {filterContent}
    </div>
  );
}
