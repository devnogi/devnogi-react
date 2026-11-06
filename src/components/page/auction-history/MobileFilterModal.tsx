"use client";

import clsx from "clsx";
import { ArrowDown, ArrowUp, Plus, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import EnchantSearchFilter from "@/components/commons/EnchantSearchFilter";
import MetalwareSearchFilter, {
  MetalwareFilterItem,
} from "@/components/commons/MetalwareSearchFilter";
import AuctionFilterDialog from "@/components/page/auction-common/AuctionFilterDialog";
import { restoreOptionFilters } from "@/components/page/auction-common/restoreOptionFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ItemCategory } from "@/data/item-category";
import { useEnchantFullnames } from "@/hooks/useEnchantFullnames";
import { useMetalwareInfos } from "@/hooks/useMetalwareInfos";
import { useSearchOptions } from "@/hooks/useSearchOptions";
import {
  ActiveFilter,
  FieldMetadata,
  SearchOptionMetadata,
} from "@/types/search-filter";

type DatePreset = "1week" | "1month" | "3months";

function getDatePresetRange(preset: DatePreset): { from: string; to: string } {
  const today = new Date();
  const to = today.toISOString().split("T")[0];
  const from = new Date(today);

  switch (preset) {
    case "1week":
      from.setDate(from.getDate() - 7);
      break;
    case "1month":
      from.setMonth(from.getMonth() - 1);
      break;
    case "3months":
      from.setMonth(from.getMonth() - 3);
      break;
  }

  return { from: from.toISOString().split("T")[0], to };
}

function inferDatePreset(dateFrom: string, dateTo: string): DatePreset | null {
  for (const preset of ["1week", "1month", "3months"] as DatePreset[]) {
    const range = getDatePresetRange(preset);
    if (range.from === dateFrom && range.to === dateTo) return preset;
  }
  return null;
}

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: "1week", label: "일주일" },
  { value: "1month", label: "한달" },
  { value: "3months", label: "3달" },
];

const EMPTY_SEARCH_OPTIONS: SearchOptionMetadata[] = [];

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterType:
    | "category"
    | "price"
    | "date"
    | "options"
    | "enchant"
    | "metalware";
  initialData?: {
    selectedCategory?: string;
    priceMin?: string;
    priceMax?: string;
    dateFrom?: string;
    dateTo?: string;
    activeFilters?: ActiveFilter[];
    optionRequest?: object;
    enchantPrefix?: string | null;
    enchantSuffix?: string | null;
    metalwareItems?: MetalwareFilterItem[];
  };
  categories?: ItemCategory[];
  onApply: (data: {
    selectedCategory?: string;
    priceMin?: string;
    priceMax?: string;
    dateFrom?: string;
    dateTo?: string;
    activeFilters?: ActiveFilter[];
    enchantPrefix?: string | null;
    enchantSuffix?: string | null;
    metalwareItems?: MetalwareFilterItem[];
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
  const { data: searchOptionsData } = useSearchOptions();
  const searchOptions = searchOptionsData ?? EMPTY_SEARCH_OPTIONS;
  const {
    prefixList,
    suffixList,
    isLoading: isEnchantLoading,
  } = useEnchantFullnames();
  const { metalwareList, isLoading: isMetalwareLoading } = useMetalwareInfos();
  const [currentTab, setCurrentTab] = useState<
    "category" | "price" | "date" | "options" | "enchant" | "metalware"
  >(initialFilterType);
  const topCategories =
    categories.find(
      (category) => category.id === "all" && category.children?.length,
    )?.children || categories.filter((category) => category.id !== "all");

  // Parse initialData.selectedCategory to extract top and sub category
  const parseSelectedCategory = (selected: string) => {
    if (!selected || selected === "all") {
      return { top: "all", sub: "all" };
    }
    const firstSlashIndex = selected.indexOf("/");
    if (firstSlashIndex === -1) {
      return { top: selected, sub: "all" };
    }
    const top = selected.slice(0, firstSlashIndex);
    const sub = selected.slice(firstSlashIndex + 1) || "all";
    return { top, sub };
  };

  const parsed = parseSelectedCategory(initialData?.selectedCategory || "all");
  const [selectedTopCategory, setSelectedTopCategory] = useState<string>(
    parsed.top,
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(
    parsed.sub,
  );

  const [priceMin, setPriceMin] = useState(initialData?.priceMin || "");
  const [priceMax, setPriceMax] = useState(initialData?.priceMax || "");

  const initialDateFrom =
    initialData?.dateFrom || getDatePresetRange("1month").from;
  const initialDateTo = initialData?.dateTo || getDatePresetRange("1month").to;
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);
  const [selectedDatePreset, setSelectedDatePreset] =
    useState<DatePreset | null>(
      inferDatePreset(initialDateFrom, initialDateTo) ?? "1month",
    );
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>(
    initialData?.activeFilters || [],
  );
  const optionRequest = initialData?.optionRequest;
  useEffect(() => {
    if (isOpen)
      setActiveFilters(
        restoreOptionFilters(optionRequest ?? {}, searchOptions),
      );
  }, [isOpen, optionRequest, searchOptionsData, searchOptions]);

  const [enchantPrefix, setEnchantPrefix] = useState<string | null>(
    initialData?.enchantPrefix ?? null,
  );
  const [enchantSuffix, setEnchantSuffix] = useState<string | null>(
    initialData?.enchantSuffix ?? null,
  );
  const [enchantResetKey, setEnchantResetKey] = useState(0);
  const [metalwareItems, setMetalwareItems] = useState<MetalwareFilterItem[]>(
    initialData?.metalwareItems ?? [],
  );
  const [metalwareResetKey, setMetalwareResetKey] = useState(0);
  const [showAddFilterDropdown, setShowAddFilterDropdown] = useState(false);
  const topCategoryScrollRef = useRef<HTMLDivElement>(null);
  const subCategoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentTab(initialFilterType);
    setShowAddFilterDropdown(false);
  }, [isOpen, initialFilterType]);

  useEffect(() => {
    if (currentTab !== "category") return;
    subCategoryScrollRef.current?.scrollTo({ top: 0 });
  }, [selectedTopCategory, currentTab]);

  const handleReset = () => {
    if (currentTab === "category") {
      setSelectedTopCategory("all");
      setSelectedSubCategory("all");
    } else if (currentTab === "price") {
      setPriceMin("");
      setPriceMax("");
    } else if (currentTab === "date") {
      const resetRange = getDatePresetRange("1month");
      setDateFrom(resetRange.from);
      setDateTo(resetRange.to);
      setSelectedDatePreset("1month");
    } else if (currentTab === "enchant") {
      setEnchantPrefix(null);
      setEnchantSuffix(null);
      setEnchantResetKey((k) => k + 1);
    } else if (currentTab === "metalware") {
      setMetalwareItems([]);
      setMetalwareResetKey((k) => k + 1);
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
    } else if (currentTab === "enchant") {
      onApply({ enchantPrefix, enchantSuffix });
    } else if (currentTab === "metalware") {
      onApply({ metalwareItems });
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

  const analyzeFilterType = useCallback(
    (searchCondition: Record<string, FieldMetadata>) => {
      const fieldNames = Object.keys(searchCondition);
      const hasFromTo = fieldNames.some(
        (name) =>
          name.endsWith("From") &&
          fieldNames.includes(name.replace("From", "To")),
      );
      if (hasFromTo) return "range";

      const hasStandard = fieldNames.some((name) => name.endsWith("Standard"));
      if (hasStandard) return "valueWithStandard";

      const hasEnum = Object.values(searchCondition).some(
        (metadata) =>
          metadata.allowedValues && metadata.allowedValues.length > 0,
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
              className="min-h-11 bg-[var(--color-ds-card)] text-[var(--color-ds-text)] rounded-lg text-sm"
            />
            <span className="text-muted-foreground text-sm">~</span>
            <Input
              type="number"
              placeholder="최대"
              value={filter.values[toField] || ""}
              onChange={(e) =>
                handleFilterValueChange(filter.id, toField, e.target.value)
              }
              className="min-h-11 bg-[var(--color-ds-card)] text-[var(--color-ds-text)] rounded-lg text-sm"
            />
          </div>
        );
      }

      if (type === "valueWithStandard") {
        const fieldNames = Object.keys(filter.searchCondition);
        const valueField = fieldNames.find(
          (name) => !name.endsWith("Standard"),
        );
        const standardField = fieldNames.find((name) =>
          name.endsWith("Standard"),
        );

        if (!valueField || !standardField) return null;

        const currentStandard =
          (filter.values[standardField] as string) || "UP";
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
              className="min-h-11 bg-[var(--color-ds-card)] text-[var(--color-ds-text)] rounded-lg text-sm flex-1"
            />
            <button
              onClick={() =>
                handleFilterValueChange(
                  filter.id,
                  standardField,
                  isUp ? "DOWN" : "UP",
                )
              }
              aria-label="조건 순서 바꾸기"
              className="h-11 w-11 rounded-lg border border-[var(--color-ds-neutral-tone)] flex items-center justify-center hover:bg-[var(--color-ds-neutral-50)] transition-colors"
            >
              {isUp ? (
                <ArrowUp className="w-5 h-5 text-[var(--color-ds-primary)]" />
              ) : (
                <ArrowDown className="w-5 h-5 text-[var(--color-ds-primary-hover)]" />
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
            <SelectTrigger className="min-h-11 bg-[var(--color-ds-card)] text-[var(--color-ds-text)] rounded-lg text-sm">
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
          className="min-h-11 bg-[var(--color-ds-card)] text-[var(--color-ds-text)] rounded-lg text-sm"
        />
      );
    },
    [analyzeFilterType, handleFilterValueChange],
  );

  const availableOptions = searchOptions.filter(
    (opt) => !activeFilters.some((f) => f.id === opt.id),
  );

  if (!isOpen) return null;

  const tabs = [
    { id: "category" as const, label: "카테고리", icon: "📁" },
    { id: "price" as const, label: "금액", icon: "💰" },
    { id: "date" as const, label: "날짜", icon: "📅" },
    { id: "options" as const, label: "옵션", icon: "⚙️" },
    { id: "enchant" as const, label: "인챈트", icon: "✨" },
    { id: "metalware" as const, label: "세공", icon: "🔨" },
  ];

  return (
    <AuctionFilterDialog onClose={onClose}>
      {/* Tabs */}
      <div className="flex shrink-0 gap-2 px-6 py-3 overflow-x-auto border-b border-[var(--color-ds-neutral-tone)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            aria-pressed={currentTab === tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex min-h-11 items-center gap-1.5 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              currentTab === tab.id
                ? "bg-[var(--color-ds-primary)] text-primary-foreground font-semibold"
                : "bg-[var(--color-ds-card)] text-[var(--color-ds-text)] hover:bg-[var(--color-ds-neutral-50)]"
            }`}
          >
            <span>{tab.icon}</span>
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
        {currentTab === "category" && (
          <div className="grid h-full min-h-0 grid-cols-2 gap-3">
            {/* 왼쪽: 상위 카테고리 */}
            <div
              ref={topCategoryScrollRef}
              className="space-y-1 border-r border-[var(--color-ds-neutral-tone)] pr-3 h-full overflow-y-auto"
            >
              <h4 className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                상위 카테고리
              </h4>
              {/* 전체 옵션 */}
              <button
                onClick={() => {
                  setSelectedTopCategory("all");
                  setSelectedSubCategory("all");
                }}
                className={clsx(
                  "w-full min-h-11 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                  selectedTopCategory === "all"
                    ? "bg-[var(--color-ds-primary-50)] text-[var(--color-ds-primary)] font-semibold"
                    : "text-[var(--color-ds-text)] hover:bg-[var(--color-ds-neutral-50)]",
                )}
              >
                전체
              </button>
              {/* topCategory 리스트 (전체 제외) */}
              {topCategories.map((category) => {
                const isSelected = selectedTopCategory === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedTopCategory(category.id);
                      setSelectedSubCategory("all");
                    }}
                    className={clsx(
                      "w-full min-h-11 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                      isSelected
                        ? "bg-[var(--color-ds-primary-50)] text-[var(--color-ds-primary)] font-semibold"
                        : "text-[var(--color-ds-text)] hover:bg-[var(--color-ds-neutral-50)]",
                    )}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>

            {/* 오른쪽: 하위 카테고리 */}
            <div
              ref={subCategoryScrollRef}
              className="space-y-1 pl-3 h-full overflow-y-auto"
            >
              <h4 className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                하위 카테고리
              </h4>
              {selectedTopCategory !== "all" ? (
                <>
                  {/* 전체 옵션 */}
                  <button
                    onClick={() => setSelectedSubCategory("all")}
                    className={clsx(
                      "w-full min-h-11 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                      selectedSubCategory === "all"
                        ? "bg-[var(--color-ds-primary-50)] text-[var(--color-ds-primary)] font-semibold"
                        : "text-[var(--color-ds-text)] hover:bg-[var(--color-ds-neutral-50)]",
                    )}
                  >
                    전체
                  </button>
                  {/* subCategory 리스트 */}
                  {topCategories
                    .find((cat) => cat.id === selectedTopCategory)
                    ?.children?.map((subCategory) => {
                      const isSelected = selectedSubCategory === subCategory.id;

                      return (
                        <button
                          key={subCategory.id}
                          onClick={() => setSelectedSubCategory(subCategory.id)}
                          className={clsx(
                            "w-full min-h-11 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                            isSelected
                              ? "bg-[var(--color-ds-primary-50)] text-[var(--color-ds-primary)] font-semibold"
                              : "text-[var(--color-ds-text)] hover:bg-[var(--color-ds-neutral-50)]",
                          )}
                        >
                          {subCategory.name}
                        </button>
                      );
                    })}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  왼쪽에서 상위 카테고리를 선택하세요
                </div>
              )}
            </div>
          </div>
        )}

        {currentTab === "price" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-[var(--color-ds-text)] mb-2 block">
                최소 금액 (골드)
              </label>
              <Input
                type="number"
                placeholder="최소 금액 입력"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="h-12 rounded-lg bg-[var(--color-ds-card)] text-base text-[var(--color-ds-text)]"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[var(--color-ds-text)] mb-2 block">
                최대 금액 (골드)
              </label>
              <Input
                type="number"
                placeholder="최대 금액 입력"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="h-12 rounded-lg bg-[var(--color-ds-card)] text-base text-[var(--color-ds-text)]"
              />
            </div>
          </div>
        )}

        {currentTab === "date" && (
          <div className="space-y-4">
            {/* 빠른 선택 라디오 */}
            <div>
              <label className="text-sm font-semibold text-[var(--color-ds-text)] mb-2 block">
                빠른 선택
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DATE_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    aria-pressed={selectedDatePreset === preset.value}
                    onClick={() => {
                      const range = getDatePresetRange(preset.value);
                      setSelectedDatePreset(preset.value);
                      setDateFrom(range.from);
                      setDateTo(range.to);
                    }}
                    className={`min-h-11 rounded-lg text-sm transition-colors ${
                      selectedDatePreset === preset.value
                        ? "bg-[var(--color-ds-primary-50)] border-2 border-[var(--color-ds-primary)] text-[var(--color-ds-primary)] font-semibold"
                        : "border border-[var(--color-ds-neutral-tone)] bg-[var(--color-ds-card)] text-[var(--color-ds-text)]"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 날짜 입력 - 한 줄 배치 */}
            <div>
              <label className="text-sm font-semibold text-[var(--color-ds-text)] mb-2 block">
                기간 선택
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  aria-label="시작일"
                  value={dateFrom}
                  onChange={(e) => {
                    setSelectedDatePreset(null);
                    setDateFrom(e.target.value);
                  }}
                  className="h-12 rounded-lg bg-[var(--color-ds-card)] text-base text-[var(--color-ds-text)] flex-1"
                  placeholder="시작일"
                />
                <span className="text-muted-foreground">~</span>
                <Input
                  type="date"
                  aria-label="종료일"
                  value={dateTo}
                  onChange={(e) => {
                    setSelectedDatePreset(null);
                    setDateTo(e.target.value);
                  }}
                  className="h-12 rounded-lg bg-[var(--color-ds-card)] text-base text-[var(--color-ds-text)] flex-1"
                  placeholder="종료일"
                />
              </div>
            </div>
          </div>
        )}

        {currentTab === "enchant" && (
          <div className="space-y-4">
            <EnchantSearchFilter
              key={enchantResetKey}
              prefixList={prefixList}
              suffixList={suffixList}
              isLoading={isEnchantLoading}
              initialPrefix={enchantPrefix}
              initialSuffix={enchantSuffix}
              onChange={(prefix, suffix) => {
                setEnchantPrefix(prefix);
                setEnchantSuffix(suffix);
              }}
            />
            {!enchantPrefix && !enchantSuffix && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                접두 또는 접미 인챈트를 선택하세요
              </div>
            )}
          </div>
        )}

        {currentTab === "options" && (
          <div className="space-y-3">
            {/* Add Filter Button */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowAddFilterDropdown(!showAddFilterDropdown)}
                className="w-full h-12 rounded-lg flex items-center justify-center gap-2"
                disabled={availableOptions.length === 0}
              >
                <Plus className="w-5 h-5" />
                필터 추가
              </Button>

              {showAddFilterDropdown && availableOptions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-ds-card)] rounded-lg border border-[var(--color-ds-neutral-tone)] max-h-60 overflow-auto z-50">
                  {availableOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleAddFilter(option)}
                      className="w-full px-4 py-3 text-left hover:bg-[var(--color-ds-neutral-50)] transition-colors"
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
                className="bg-[var(--color-ds-card)] rounded-lg border border-[var(--color-ds-neutral-tone)] p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-[var(--color-ds-text)]">
                    {filter.searchOptionName}
                  </h4>
                  <button
                    aria-label={`${filter.searchOptionName} 필터 삭제`}
                    onClick={() => handleRemoveFilter(filter.id)}
                    className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--color-ds-text)] hover:text-[var(--color-ds-danger)] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {renderFilterInputs(filter)}
              </div>
            ))}

            {activeFilters.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                추가된 옵션 필터가 없습니다
              </div>
            )}
          </div>
        )}

        {currentTab === "metalware" && (
          <div className="overflow-y-auto h-full">
            <MetalwareSearchFilter
              key={metalwareResetKey}
              metalwareList={metalwareList}
              isLoading={isMetalwareLoading}
              initialItems={metalwareItems}
              onChange={setMetalwareItems}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-[var(--color-ds-neutral-tone)] px-6 py-4 bg-[var(--color-ds-card)]">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 h-12 rounded-lg font-semibold"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            초기화
          </Button>
          <Button
            onClick={handleApply}
            disabled={currentTab === "options" && !searchOptionsData}
            className="flex-1 h-12 rounded-lg bg-[var(--color-ds-primary)] hover:bg-[var(--color-ds-primary-hover)] text-primary-foreground font-semibold"
          >
            적용하기
          </Button>
        </div>
      </div>
    </AuctionFilterDialog>
  );
}
