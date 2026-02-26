"use client";

import { useState, useCallback, useRef } from "react";
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
import { useEnchantFullnames } from "@/hooks/useEnchantFullnames";
import { useMetalwareInfos } from "@/hooks/useMetalwareInfos";
import {
  SearchOptionMetadata,
  FieldMetadata,
  ActiveFilter,
} from "@/types/search-filter";
import { AuctionRealtimeSearchParams } from "@/types/auction-realtime";
import { LayoutMode } from "@/hooks/useAuctionHistoryLayout";
import EnchantSearchFilter from "@/components/commons/EnchantSearchFilter";
import MetalwareSearchFilter, {
  MetalwareFilterItem,
} from "@/components/commons/MetalwareSearchFilter";
import { Plus, X, RotateCcw, ArrowUp, ArrowDown, Check } from "lucide-react";

interface SearchFilterCardProps {
  onFilterApply: (filters: AuctionRealtimeSearchParams) => void;
  isModal?: boolean;
  onClose?: () => void;
  /** 현재 레이아웃 모드 - 데스크탑/태블릿에 따라 위치 조정 */
  layoutMode?: LayoutMode;
  /** 아이템명 완전 일치 검색 여부 */
  isExactItemName?: boolean;
  onExactItemNameChange?: (value: boolean) => void;
}

interface BasicFilters {
  priceMin: string;
  priceMax: string;
}

export default function SearchFilterCard({
  onFilterApply,
  isModal = false,
  onClose,
  layoutMode = "desktop",
  isExactItemName = false,
  onExactItemNameChange,
}: SearchFilterCardProps) {
  // 레이아웃 모드에 따른 필터 카드 위치 계산
  const filterRightPosition =
    layoutMode === "desktop"
      ? "max(16px, calc(50% - 710px))"
      : "max(16px, calc(50% - 728px))";
  const { data: searchOptions = [], isLoading } = useSearchOptions();
  const { prefixList, suffixList, isLoading: isEnchantLoading } = useEnchantFullnames();
  const { metalwareList, isLoading: isMetalwareLoading } = useMetalwareInfos();
  const enchantRef = useRef<{ prefix: string | null; suffix: string | null }>({
    prefix: null,
    suffix: null,
  });
  const metalwareRef = useRef<MetalwareFilterItem[]>([]);
  const [enchantResetKey, setEnchantResetKey] = useState(0);
  const [metalwareResetKey, setMetalwareResetKey] = useState(0);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [basicFilters, setBasicFilters] = useState<BasicFilters>({
    priceMin: "",
    priceMax: "",
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
    });
    setActiveFilters([]);
    enchantRef.current = { prefix: null, suffix: null };
    metalwareRef.current = [];
    setEnchantResetKey((k) => k + 1);
    setMetalwareResetKey((k) => k + 1);
  }, []);

  const handleApply = useCallback(() => {
    const searchParams: AuctionRealtimeSearchParams = {};

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

    // 실시간 경매장은 날짜 필터 없음

    // Build enchant search request
    if (enchantRef.current.prefix || enchantRef.current.suffix) {
      searchParams.enchantSearchRequest = {};
      if (enchantRef.current.prefix) {
        searchParams.enchantSearchRequest.enchantPrefix = enchantRef.current.prefix;
      }
      if (enchantRef.current.suffix) {
        searchParams.enchantSearchRequest.enchantSuffix = enchantRef.current.suffix;
      }
    }

    // Build item option search request from dynamic filters
    if (activeFilters.length > 0) {
      searchParams.itemOptionSearchRequest = {};

      activeFilters.forEach((filter) => {
        // Map filter values to nested structure
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

    // Build metalware search requests
    const validMetalwares = metalwareRef.current.filter(
      (f) => f.name.trim() !== "",
    );
    if (validMetalwares.length > 0) {
      searchParams.metalwareSearchRequests = validMetalwares.map((f) => ({
        metalware: f.name.trim(),
        ...(f.levelFrom !== "" && { levelFrom: Number(f.levelFrom) }),
        ...(f.levelTo !== "" && { levelTo: Number(f.levelTo) }),
      }));
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
              className="h-9 rounded-xl text-sm border-gray-300 dark:border-navy-500 bg-white dark:bg-navy-600 dark:text-white dark:placeholder-gray-400 focus:border-blaanid-500 dark:focus:border-coral-500 focus:ring-2 focus:ring-blaanid-500/20 dark:focus:ring-coral-500/20"
            />
            <span className="text-gray-400 text-sm">~</span>
            <Input
              type="number"
              placeholder="최대"
              value={filter.values[toField] || ""}
              onChange={(e) =>
                handleFilterValueChange(filter.id, toField, e.target.value)
              }
              className="h-9 rounded-xl text-sm border-gray-300 dark:border-navy-500 bg-white dark:bg-navy-600 dark:text-white dark:placeholder-gray-400 focus:border-blaanid-500 dark:focus:border-coral-500 focus:ring-2 focus:ring-blaanid-500/20 dark:focus:ring-coral-500/20"
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
              className="h-9 rounded-xl text-sm flex-1 border-gray-300 dark:border-navy-500 bg-white dark:bg-navy-600 dark:text-white dark:placeholder-gray-400 focus:border-blaanid-500 dark:focus:border-coral-500 focus:ring-2 focus:ring-blaanid-500/20 dark:focus:ring-coral-500/20"
            />
            <button
              onClick={() =>
                handleFilterValueChange(
                  filter.id,
                  standardField,
                  isUp ? "DOWN" : "UP",
                )
              }
              className="h-9 w-9 rounded-xl border border-gray-300 dark:border-navy-500 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-navy-600 transition-colors"
              title={isUp ? "이상 (클릭하면 이하)" : "이하 (클릭하면 이상)"}
            >
              {isUp ? (
                <ArrowUp className="w-4 h-4 text-blaanid-600 dark:text-coral-400" />
              ) : (
                <ArrowDown className="w-4 h-4 text-blaanid-500 dark:text-coral-500" />
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
            <SelectTrigger className="h-9 rounded-xl text-sm border-gray-300 dark:border-navy-500 bg-white dark:bg-navy-600 dark:text-white focus:ring-2 focus:ring-blaanid-500/20 dark:focus:ring-coral-500/20">
              <SelectValue placeholder="선택하세요" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-gray-200 dark:border-navy-500 dark:bg-navy-700">
              {enumMetadata.allowedValues?.map((val) => (
                <SelectItem key={val} value={val} className="rounded-lg dark:text-gray-200 dark:hover:bg-navy-600">
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
          className="h-9 rounded-xl text-sm border-gray-300 dark:border-navy-500 bg-white dark:bg-navy-600 dark:text-white dark:placeholder-gray-400 focus:border-blaanid-500 dark:focus:border-coral-500 focus:ring-2 focus:ring-blaanid-500/20 dark:focus:ring-coral-500/20"
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
      <div className="bg-white dark:bg-navy-700 rounded-xl border border-gray-200 dark:border-navy-500 p-4 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400 text-sm">로딩 중...</div>
      </div>
    );

    if (isModal) {
      return (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
          <div className="fixed inset-x-4 top-20 bottom-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-80 md:top-24 md:bottom-24 z-50">
            {loadingContent}
          </div>
        </>
      );
    }

    return (
      <div
        className="fixed top-[140px] bottom-8 w-64"
        style={{ right: filterRightPosition }}
      >
        {loadingContent}
      </div>
    );
  }

  const filterContent = (
    <div className="space-y-2">
      {/* Header - Minimal */}
      <div className="bg-white dark:bg-navy-700 rounded-xl border border-gray-200 dark:border-navy-500 py-2.5 px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            검색 필터
          </h2>
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Exact Item Name Toggle - Compact Card */}
      <button
        type="button"
        onClick={() => onExactItemNameChange?.(!isExactItemName)}
        className={`w-full rounded-xl border cursor-pointer py-2 px-3 flex items-center gap-2.5 transition-all ${
          isExactItemName
            ? "bg-blaanid-50 dark:bg-coral-500/10 border-blaanid-400 dark:border-coral-500"
            : "bg-white dark:bg-navy-700 border-gray-200 dark:border-navy-500 hover:border-gray-300 dark:hover:border-navy-400"
        }`}
      >
        <div
          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all ${
            isExactItemName
              ? "bg-blaanid-500 dark:bg-coral-500 border-0"
              : "border border-gray-300 dark:border-navy-400 bg-white dark:bg-navy-600"
          }`}
        >
          {isExactItemName && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </div>
        <span
          className={`text-xs font-medium leading-none ${
            isExactItemName
              ? "text-blaanid-700 dark:text-coral-300"
              : "text-gray-600 dark:text-gray-300"
          }`}
        >
          아이템명 완전 일치
        </span>
      </button>

      {/* Price Filter Only - 날짜 필터 없음 */}
      <div className="bg-gray-50 dark:bg-navy-700 rounded-xl border border-gray-200 dark:border-navy-500 p-3">
        {/* Price Section */}
        <div>
          <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            금액 (골드)
          </h3>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="최소"
              value={basicFilters.priceMin}
              onChange={(e) =>
                setBasicFilters({ ...basicFilters, priceMin: e.target.value })
              }
              className="h-9 rounded-xl text-sm border-gray-300 dark:border-navy-500 bg-white dark:bg-navy-600 dark:text-white dark:placeholder-gray-400 focus:border-blaanid-500 dark:focus:border-coral-500 focus:ring-2 focus:ring-blaanid-500/20 dark:focus:ring-coral-500/20"
            />
            <span className="text-gray-400 text-sm">~</span>
            <Input
              type="number"
              placeholder="최대"
              value={basicFilters.priceMax}
              onChange={(e) =>
                setBasicFilters({ ...basicFilters, priceMax: e.target.value })
              }
              className="h-9 rounded-xl text-sm border-gray-300 dark:border-navy-500 bg-white dark:bg-navy-600 dark:text-white dark:placeholder-gray-400 focus:border-blaanid-500 dark:focus:border-coral-500 focus:ring-2 focus:ring-blaanid-500/20 dark:focus:ring-coral-500/20"
            />
          </div>
        </div>
      </div>

      {/* Metalware Search Filter */}
      <MetalwareSearchFilter
        key={`metalware-${metalwareResetKey}`}
        metalwareList={metalwareList}
        isLoading={isMetalwareLoading}
        flat={isModal}
        onChange={(filters) => {
          metalwareRef.current = filters;
        }}
      />

      {/* Enchant Search Filter */}
      <EnchantSearchFilter
        key={`enchant-${enchantResetKey}`}
        prefixList={prefixList}
        suffixList={suffixList}
        isLoading={isEnchantLoading}
        flat={isModal}
        onChange={(prefix, suffix) => {
          enchantRef.current = { prefix, suffix };
        }}
      />

      {/* Add Filter Button - Compact */}
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setShowAddFilterDropdown(!showAddFilterDropdown)}
          className="w-full h-9 rounded-xl flex items-center justify-center gap-2 text-sm border-gray-300 dark:border-navy-500 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-600 hover:border-gray-400 dark:hover:border-navy-400"
          disabled={availableOptions.length === 0}
        >
          <Plus className="w-4 h-4" />
          필터 추가
        </Button>

        {showAddFilterDropdown && availableOptions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-navy-700 rounded-xl shadow-[0_8px_24px_rgba(61,56,47,0.10)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-navy-500 max-h-56 overflow-auto z-50">
            {availableOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAddFilter(option)}
                className="w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-navy-600 transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                {option.searchOptionName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Filters - Compact Cards */}
      {activeFilters.map((filter) => (
        <div
          key={filter.id}
          className="bg-gray-50 dark:bg-navy-700 rounded-xl border border-gray-200 dark:border-navy-500 p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300">
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

      {/* Action Buttons - Compact */}
      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          onClick={handleReset}
          className="flex-1 h-9 rounded-xl flex items-center justify-center gap-1.5 text-sm border-gray-300 dark:border-navy-500 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-600"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          초기화
        </Button>
        <Button
          onClick={handleApply}
          className="flex-1 h-9 rounded-xl bg-blaanid-600 dark:bg-coral-500 text-white hover:bg-blaanid-700 dark:hover:bg-coral-600 text-sm font-medium"
        >
          검색 적용
        </Button>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Modal */}
        <div className="fixed inset-x-4 top-20 bottom-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-80 md:top-24 md:bottom-24 z-50 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {filterContent}
        </div>
      </>
    );
  }

  return (
    <div
      className="fixed top-[140px] bottom-8 w-64 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      style={{ right: filterRightPosition }}
    >
      {filterContent}
    </div>
  );
}
