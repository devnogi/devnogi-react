"use client";

import AuctionHistoryList from "@/components/page/auction-history/AuctionHistoryList";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import CategorySection from "@/components/commons/Category";
import CategoryDropdown from "@/components/commons/CategoryDropdown";
import SearchFilterCard from "@/components/page/auction-history/SearchFilterCard";
import MobileFilterChips from "@/components/page/auction-history/MobileFilterChips";
import MobileFilterModal from "@/components/page/auction-history/MobileFilterModal";
import ItemInfoPagination from "@/components/page/item-info/ItemInfoPagination";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useItemCategories } from "@/hooks/useItemCategories";
import { ItemCategory } from "@/data/item-category";
import { useAuctionHistory } from "@/hooks/useAuctionHistory";
import { useAuctionHistoryLayout } from "@/hooks/useAuctionHistoryLayout";
import { AuctionHistorySearchParams } from "@/types/auction-history";
import { ActiveFilter } from "@/types/search-filter";
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  type ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

const DEFAULT_PAGE_SIZE = 20;
const MIN_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

const DEFAULT_SEARCH_PARAMS: AuctionHistorySearchParams = {
  page: 1,
  size: DEFAULT_PAGE_SIZE,
  sortBy: "dateAuctionBuy",
  direction: "desc",
  isExactItemName: true,
};
const EXACT_ITEM_NAME_WARNING_DISMISS_KEY =
  "auctionExactItemNameDisableWarningDismissed";

function getDefaultDateRange(): { from: string; to: string } {
  const today = new Date();
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  return {
    from: monthAgo.toISOString().split("T")[0],
    to: today.toISOString().split("T")[0],
  };
}

function getInitialSearchParams(): AuctionHistorySearchParams {
  const dateRange = getDefaultDateRange();
  return {
    ...DEFAULT_SEARCH_PARAMS,
    dateAuctionBuyRequest: {
      dateAuctionBuyFrom: dateRange.from,
      dateAuctionBuyTo: dateRange.to,
    },
  };
}

const SORT_OPTIONS: Array<{
  label: string;
  sortBy: string;
  direction: "asc" | "desc";
}> = [
  { label: "거래 최신순", sortBy: "dateAuctionBuy", direction: "desc" },
  { label: "거래 오래된순", sortBy: "dateAuctionBuy", direction: "asc" },
  {
    label: "개당 가격 낮은순",
    sortBy: "auctionPricePerUnit",
    direction: "asc",
  },
  {
    label: "개당 가격 높은순",
    sortBy: "auctionPricePerUnit",
    direction: "desc",
  },
];

function parseNumber(
  value: string | null,
  fallback: number,
  min = 1,
  max?: number,
) {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  let normalized = Math.floor(parsed);
  if (min !== undefined && normalized < min) {
    normalized = min;
  }
  if (max !== undefined && normalized > max) {
    normalized = max;
  }
  return normalized;
}

function parseDirection(value: string | null): "asc" | "desc" {
  if (!value) return "desc";
  return value.toLowerCase() === "asc" ? "asc" : "desc";
}

function setNestedValue(
  target: Record<string, unknown>,
  key: string,
  rawValue: string,
) {
  const parts = key.split(".");
  if (parts.length < 2) return;

  let current: Record<string, unknown> = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (
      typeof current[part] !== "object" ||
      current[part] === null ||
      Array.isArray(current[part])
    ) {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }

  const lastKey = parts[parts.length - 1];
  const numberValue = Number(rawValue);
  current[lastKey] = Number.isFinite(numberValue) && rawValue.trim() !== ""
    ? numberValue
    : rawValue;
}

function cleanEmptyObject<T>(obj: T): T {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return obj;
  }

  const result = Object.entries(obj as Record<string, unknown>).reduce(
    (acc, [key, value]) => {
      const cleanedValue = cleanEmptyObject(value);
      if (
        cleanedValue !== undefined &&
        cleanedValue !== null &&
        !(typeof cleanedValue === "string" && cleanedValue === "") &&
        !(
          typeof cleanedValue === "object" &&
          !Array.isArray(cleanedValue) &&
          Object.keys(cleanedValue as Record<string, unknown>).length === 0
        )
      ) {
        acc[key] = cleanedValue;
      }
      return acc;
    },
    {} as Record<string, unknown>,
  );

  return result as T;
}

function buildNestedQueryParams(
  obj: Record<string, unknown>,
  prefix = "",
): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined || value === "") {
      return;
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      const nestedParams = buildNestedQueryParams(
        value as Record<string, unknown>,
        fullKey,
      );
      nestedParams.forEach((v, k) => params.append(k, v));
      return;
    }

    params.append(fullKey, String(value));
  });

  return params;
}

function categoryIdFromSearchParams(params: AuctionHistorySearchParams): string {
  if (!params.itemTopCategory) return "all";
  if (!params.itemSubCategory) return params.itemTopCategory;
  return `${params.itemTopCategory}/${params.itemSubCategory}`;
}

function extractCategoryParts(categoryId: string): {
  top?: string;
  sub?: string;
} {
  if (!categoryId || categoryId === "all") {
    return {};
  }

  const firstSlashIndex = categoryId.indexOf("/");
  if (firstSlashIndex === -1) {
    return { top: categoryId };
  }

  const top = categoryId.slice(0, firstSlashIndex);
  const sub = categoryId.slice(firstSlashIndex + 1);

  return {
    top: top || undefined,
    sub: sub || undefined,
  };
}

function normalizeCategorySelection<T extends { itemTopCategory?: string; itemSubCategory?: string }>(
  params: T,
): T {
  const { itemTopCategory, itemSubCategory } = params;
  if (itemTopCategory && itemSubCategory) {
    const prefix = `${itemTopCategory}/`;
    if (itemSubCategory.startsWith(prefix)) {
      const trimmed = itemSubCategory.slice(prefix.length);
      params.itemSubCategory = trimmed || undefined;
    } else {
      const suffix = `/${itemTopCategory}`;
      if (itemSubCategory.endsWith(suffix)) {
        const trimmed = itemSubCategory.slice(0, -suffix.length);
        params.itemSubCategory = trimmed || undefined;
      }
    }
  }
  return params;
}

function parseSearchParamsFromUrl(
  urlSearchParams: ReadonlyURLSearchParams,
): AuctionHistorySearchParams {
  const parsed: AuctionHistorySearchParams = {
    ...DEFAULT_SEARCH_PARAMS,
  };

  parsed.page = parseNumber(urlSearchParams.get("page"), 1, 1);
  parsed.size = parseNumber(
    urlSearchParams.get("size"),
    DEFAULT_PAGE_SIZE,
    MIN_PAGE_SIZE,
    MAX_PAGE_SIZE,
  );

  const sortBy = urlSearchParams.get("sortBy");
  if (sortBy) {
    parsed.sortBy = sortBy;
  }

  parsed.direction = parseDirection(urlSearchParams.get("direction"));

  const itemName =
    urlSearchParams.get("item_name") ||
    urlSearchParams.get("itemName") ||
    urlSearchParams.get("name");
  if (itemName) {
    parsed.itemName = itemName;
  }

  const itemTopCategory =
    urlSearchParams.get("top_category") ||
    urlSearchParams.get("itemTopCategory") ||
    urlSearchParams.get("topCategory");
  const itemSubCategory =
    urlSearchParams.get("sub_category") ||
    urlSearchParams.get("itemSubCategory") ||
    urlSearchParams.get("subCategory");

  if (itemTopCategory) {
    parsed.itemTopCategory = itemTopCategory;
  }
  if (itemSubCategory) {
    parsed.itemSubCategory = itemSubCategory;
  }

  if (!itemTopCategory) {
    const legacyCategory = urlSearchParams.get("category");
    if (legacyCategory && legacyCategory !== "all") {
      const { top, sub } = extractCategoryParts(legacyCategory);
      if (top) {
        parsed.itemTopCategory = top;
      }
      if (sub) {
        parsed.itemSubCategory = sub;
      }
    }
  }

  const exactMatch = urlSearchParams.get("exact_match");
  if (exactMatch === "true") {
    parsed.isExactItemName = true;
  } else if (exactMatch === "false") {
    parsed.isExactItemName = false;
  }

  urlSearchParams.forEach((value, key) => {
    if (
      [
        "page",
        "size",
        "sortBy",
        "direction",
        "itemName",
        "name",
        "item_name",
        "top_category",
        "topCategory",
        "itemTopCategory",
        "sub_category",
        "subCategory",
        "itemSubCategory",
        "category",
        "exact_match",
      ].includes(key)
    ) {
      return;
    }

    if (!key.includes(".")) {
      return;
    }

    setNestedValue(parsed as unknown as Record<string, unknown>, key, value);
  });

  return normalizeCategorySelection(cleanEmptyObject(parsed));
}

function serializeSearchParams(params: AuctionHistorySearchParams): string {
  const normalized: AuctionHistorySearchParams = normalizeCategorySelection({ ...params });

  if (
    normalized.page === undefined ||
    normalized.page === DEFAULT_SEARCH_PARAMS.page
  ) {
    delete normalized.page;
  }
  if (
    normalized.size === undefined ||
    normalized.size === DEFAULT_SEARCH_PARAMS.size
  ) {
    delete normalized.size;
  }
  if (
    normalized.sortBy === undefined ||
    normalized.sortBy === DEFAULT_SEARCH_PARAMS.sortBy
  ) {
    delete normalized.sortBy;
  }
  if (
    normalized.direction === undefined ||
    normalized.direction === DEFAULT_SEARCH_PARAMS.direction
  ) {
    delete normalized.direction;
  }

  const cleaned = cleanEmptyObject(normalized) as Record<string, unknown>;

  const queryParams = buildNestedQueryParams(cleaned);
  if (normalized.itemName) {
    queryParams.set("item_name", normalized.itemName);
    queryParams.delete("itemName");
  }
  if (normalized.isExactItemName === false) {
    queryParams.set("exact_match", "false");
  } else {
    queryParams.delete("exact_match");
  }
  queryParams.delete("isExactItemName");
  if (normalized.itemTopCategory) {
    queryParams.set("top_category", normalized.itemTopCategory);
    queryParams.delete("itemTopCategory");
  }
  if (normalized.itemSubCategory) {
    queryParams.set("sub_category", normalized.itemSubCategory);
    queryParams.delete("itemSubCategory");
  }

  const sortedQueryParams = new URLSearchParams(
    Array.from(queryParams.entries()).sort(([a], [b]) => a.localeCompare(b)),
  );

  return sortedQueryParams.toString();
}

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();
  const urlSearchParams = useSearchParams();
  const lastSyncedQueryRef = useRef<string>("");

  const [itemName, setItemName] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchParams, setSearchParams] = useState<AuctionHistorySearchParams>(
    getInitialSearchParams,
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [skipExactItemNameWarning, setSkipExactItemNameWarning] = useState(false);
  const [showExactItemNameWarning, setShowExactItemNameWarning] = useState(false);
  const [dontShowExactItemNameWarningAgain, setDontShowExactItemNameWarningAgain] =
    useState(false);

  const [mobileFilterType, setMobileFilterType] = useState<
    "category" | "price" | "date" | "options" | "enchant" | null
  >(null);
  const [mobilePriceMin, setMobilePriceMin] = useState("");
  const [mobilePriceMax, setMobilePriceMax] = useState("");
  const defaultDateRange = getDefaultDateRange();
  const [mobileDateFrom, setMobileDateFrom] = useState(defaultDateRange.from);
  const [mobileDateTo, setMobileDateTo] = useState(defaultDateRange.to);
  const [mobileActiveFilters, setMobileActiveFilters] = useState<ActiveFilter[]>(
    [],
  );
  const [mobileEnchantPrefix, setMobileEnchantPrefix] = useState<string | null>(null);
  const [mobileEnchantSuffix, setMobileEnchantSuffix] = useState<string | null>(null);

  const { data: categories = [], isLoading: isCategoriesLoading } =
    useItemCategories();

  const {
    layoutMode,
    showCategorySidebar,
    showFilterSidebar,
    showMobileFilter,
  } = useAuctionHistoryLayout();

  const {
    data,
    isLoading,
    isFetching,
  } = useAuctionHistory(searchParams);

  const allItems = data?.items ?? [];
  const meta = data?.meta;
  const totalElements = meta?.totalElements ?? 0;
  const currentPage = meta?.currentPage ?? (searchParams.page ?? 1);
  const totalPages = meta?.totalPages ?? 1;
  const pageSize = meta?.pageSize ?? (searchParams.size ?? DEFAULT_PAGE_SIZE);

  const selectedSortOption =
    SORT_OPTIONS.find(
      (option) =>
        option.sortBy === searchParams.sortBy &&
        option.direction === searchParams.direction,
    ) || SORT_OPTIONS[0];

  const isResultCountLoading = isLoading || isFetching;
  const resultCountNode = isResultCountLoading ? (
    <Skeleton className="inline-block h-4 w-12 align-middle rounded-md ml-1" />
  ) : (
    <span className="font-semibold inline-block ml-1">{totalElements}</span>
  );

  const findCategoryPath = useCallback(
    (
      categoryList: ItemCategory[],
      targetId: string,
      currentPath: ItemCategory[] = [],
    ): ItemCategory[] => {
      for (const category of categoryList) {
        const newPath = [...currentPath, category];
        if (category.id === targetId) {
          return newPath;
        }
        if (category.children) {
          const foundPath = findCategoryPath(
            category.children,
            targetId,
            newPath,
          );
          if (foundPath.length > 0) {
            return foundPath;
          }
        }
      }
      return [];
    },
    [],
  );

  const categoryPath = useMemo(
    () => findCategoryPath(categories, selectedCategory),
    [selectedCategory, categories, findCategoryPath],
  );

  useEffect(() => {
    const idsToExpand = categoryPath.slice(0, -1).map((c) => c.id);

    setExpandedIds((prev) => {
      const allAlreadyExpanded = idsToExpand.every((id) => prev.has(id));
      if (allAlreadyExpanded && prev.size === idsToExpand.length) {
        return prev;
      }
      return new Set(idsToExpand);
    });
  }, [categoryPath]);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(EXACT_ITEM_NAME_WARNING_DISMISS_KEY);
    setSkipExactItemNameWarning(saved === "true");
  }, []);

  // URL -> state 동기화
  useEffect(() => {
    const parsed = parseSearchParamsFromUrl(urlSearchParams);
    const parsedQuery = serializeSearchParams(parsed);

    if (parsedQuery === lastSyncedQueryRef.current) {
      return;
    }

    lastSyncedQueryRef.current = parsedQuery;

    setSearchParams(parsed);
    setItemName(parsed.itemName ?? "");
    setSelectedCategory(categoryIdFromSearchParams(parsed));

    setMobilePriceMin(parsed.priceSearchRequest?.priceFrom?.toString() ?? "");
    setMobilePriceMax(parsed.priceSearchRequest?.priceTo?.toString() ?? "");
    setMobileDateFrom(parsed.dateAuctionBuyRequest?.dateAuctionBuyFrom ?? "");
    setMobileDateTo(parsed.dateAuctionBuyRequest?.dateAuctionBuyTo ?? "");
    setMobileEnchantPrefix(parsed.enchantSearchRequest?.enchantPrefix ?? null);
    setMobileEnchantSuffix(parsed.enchantSearchRequest?.enchantSuffix ?? null);
  }, [urlSearchParams]);

  const applyExactItemNameChange = useCallback((value: boolean) => {
    setSearchParams((prev) => ({
      ...prev,
      isExactItemName: value,
      page: 1,
    }));
  }, []);

  const handleExactItemNameChange = useCallback(
    (value: boolean) => {
      if (!!searchParams.isExactItemName && !value && !skipExactItemNameWarning) {
        setShowExactItemNameWarning(true);
        return;
      }
      applyExactItemNameChange(value);
    },
    [applyExactItemNameChange, searchParams.isExactItemName, skipExactItemNameWarning],
  );

  const handleConfirmDisableExactItemName = useCallback(() => {
    if (dontShowExactItemNameWarningAgain) {
      localStorage.setItem(EXACT_ITEM_NAME_WARNING_DISMISS_KEY, "true");
      setSkipExactItemNameWarning(true);
    }
    setShowExactItemNameWarning(false);
    setDontShowExactItemNameWarningAgain(false);
    applyExactItemNameChange(false);
  }, [applyExactItemNameChange, dontShowExactItemNameWarningAgain]);

  const handleExactItemNameWarningOpenChange = useCallback((open: boolean) => {
    setShowExactItemNameWarning(open);
    if (!open) {
      setDontShowExactItemNameWarningAgain(false);
    }
  }, []);

  // state -> URL 동기화
  useEffect(() => {
    const nextQuery = serializeSearchParams(searchParams);

    if (nextQuery === lastSyncedQueryRef.current) {
      return;
    }

    lastSyncedQueryRef.current = nextQuery;
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [searchParams, router, pathname]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);

    if (isClientMounted) {
      localStorage.setItem("lastSelectedCategoryTradeLog", categoryId);
    }

    setSearchParams((prev) => {
      const next: AuctionHistorySearchParams = {
        ...prev,
        page: 1,
      };

      if (categoryId === "all") {
        delete next.itemTopCategory;
        delete next.itemSubCategory;
      } else {
        const { top, sub } = extractCategoryParts(categoryId);
        if (top) {
          next.itemTopCategory = top;
        }
        if (sub) {
          next.itemSubCategory = sub;
        } else {
          delete next.itemSubCategory;
        }
      }

      return normalizeCategorySelection(next);
    });
  };

  const handleToggleExpand = (categoryId: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleFilterApply = (filters: AuctionHistorySearchParams) => {
    setSearchParams((prev) => {
      const next: AuctionHistorySearchParams = {
        ...prev,
        page: 1,
      };

      if (filters.priceSearchRequest) {
        next.priceSearchRequest = filters.priceSearchRequest;
      } else {
        delete next.priceSearchRequest;
      }

      if (filters.dateAuctionBuyRequest) {
        next.dateAuctionBuyRequest = filters.dateAuctionBuyRequest;
      } else {
        delete next.dateAuctionBuyRequest;
      }

      if (filters.itemOptionSearchRequest) {
        next.itemOptionSearchRequest = filters.itemOptionSearchRequest;
      } else {
        delete next.itemOptionSearchRequest;
      }

      if (filters.enchantSearchRequest) {
        next.enchantSearchRequest = filters.enchantSearchRequest;
      } else {
        delete next.enchantSearchRequest;
      }

      return normalizeCategorySelection(next);
    });
    // isExactItemName은 SearchFilterCard에서 직접 onExactItemNameChange로 관리

    setMobilePriceMin(filters.priceSearchRequest?.priceFrom?.toString() ?? "");
    setMobilePriceMax(filters.priceSearchRequest?.priceTo?.toString() ?? "");
    setMobileDateFrom(filters.dateAuctionBuyRequest?.dateAuctionBuyFrom ?? "");
    setMobileDateTo(filters.dateAuctionBuyRequest?.dateAuctionBuyTo ?? "");
    setMobileEnchantPrefix(filters.enchantSearchRequest?.enchantPrefix ?? null);
    setMobileEnchantSuffix(filters.enchantSearchRequest?.enchantSuffix ?? null);
  };

  const handleMobileFilterApply = (data: {
    selectedCategory?: string;
    priceMin?: string;
    priceMax?: string;
    dateFrom?: string;
    dateTo?: string;
    activeFilters?: ActiveFilter[];
    enchantPrefix?: string | null;
    enchantSuffix?: string | null;
  }) => {
    if (data.selectedCategory !== undefined) {
      setSelectedCategory(data.selectedCategory);
      if (isClientMounted) {
        localStorage.setItem(
          "lastSelectedCategoryTradeLog",
          data.selectedCategory,
        );
      }
    }

    if (data.priceMin !== undefined) setMobilePriceMin(data.priceMin);
    if (data.priceMax !== undefined) setMobilePriceMax(data.priceMax);
    if (data.dateFrom !== undefined) setMobileDateFrom(data.dateFrom);
    if (data.dateTo !== undefined) setMobileDateTo(data.dateTo);
    if (data.activeFilters !== undefined) {
      setMobileActiveFilters(data.activeFilters);
    }
    if (data.enchantPrefix !== undefined) setMobileEnchantPrefix(data.enchantPrefix);
    if (data.enchantSuffix !== undefined) setMobileEnchantSuffix(data.enchantSuffix);

    setSearchParams((prev) => {
      const next: AuctionHistorySearchParams = {
        ...prev,
        page: 1,
      };

      if (data.selectedCategory !== undefined) {
        const category = data.selectedCategory;

        if (category !== "all") {
          const { top, sub } = extractCategoryParts(category);
          if (top) {
            next.itemTopCategory = top;
          }
          if (sub) {
            next.itemSubCategory = sub;
          } else {
            delete next.itemSubCategory;
          }
        } else {
          delete next.itemTopCategory;
          delete next.itemSubCategory;
        }
      }

      const minPrice = data.priceMin !== undefined ? data.priceMin : mobilePriceMin;
      const maxPrice = data.priceMax !== undefined ? data.priceMax : mobilePriceMax;
      if (minPrice || maxPrice) {
        next.priceSearchRequest = {};
        if (minPrice) next.priceSearchRequest.priceFrom = Number(minPrice);
        if (maxPrice) next.priceSearchRequest.priceTo = Number(maxPrice);
      } else {
        delete next.priceSearchRequest;
      }

      const from = data.dateFrom !== undefined ? data.dateFrom : mobileDateFrom;
      const to = data.dateTo !== undefined ? data.dateTo : mobileDateTo;
      if (from || to) {
        next.dateAuctionBuyRequest = {};
        if (from) next.dateAuctionBuyRequest.dateAuctionBuyFrom = from;
        if (to) next.dateAuctionBuyRequest.dateAuctionBuyTo = to;
      } else {
        delete next.dateAuctionBuyRequest;
      }

      const filters =
        data.activeFilters !== undefined ? data.activeFilters : mobileActiveFilters;
      if (filters.length > 0) {
        next.itemOptionSearchRequest = {};

        filters.forEach((filter) => {
          Object.entries(filter.values).forEach(([key, value]) => {
            if (value === undefined || value === "") return;

            let optionSearchKey: string;
            if (key.endsWith("From") || key.endsWith("To")) {
              const baseName = key.replace(/(From|To)$/, "");
              optionSearchKey = `${baseName}Search`;
            } else if (key.endsWith("Standard")) {
              const baseName = key.replace(/Standard$/, "");
              optionSearchKey = `${baseName}Search`;
            } else if (key === "wearingRestrictions") {
              optionSearchKey = "wearingRestrictionsSearch";
            } else if (key === "ergRank") {
              optionSearchKey = "ergRankSearch";
            } else {
              optionSearchKey = `${key}Search`;
            }

            if (
              !next.itemOptionSearchRequest![
                optionSearchKey as keyof typeof next.itemOptionSearchRequest
              ]
            ) {
              (
                next.itemOptionSearchRequest as Record<
                  string,
                  Record<string, unknown>
                >
              )[optionSearchKey] = {};
            }

            (
              next.itemOptionSearchRequest as Record<
                string,
                Record<string, unknown>
              >
            )[optionSearchKey][key] = value;
          });
        });
      } else {
        delete next.itemOptionSearchRequest;
      }

      const enchantPrefixVal = data.enchantPrefix !== undefined ? data.enchantPrefix : mobileEnchantPrefix;
      const enchantSuffixVal = data.enchantSuffix !== undefined ? data.enchantSuffix : mobileEnchantSuffix;
      if (enchantPrefixVal || enchantSuffixVal) {
        next.enchantSearchRequest = {};
        if (enchantPrefixVal) next.enchantSearchRequest.enchantPrefix = enchantPrefixVal;
        if (enchantSuffixVal) next.enchantSearchRequest.enchantSuffix = enchantSuffixVal;
      } else {
        delete next.enchantSearchRequest;
      }

      return normalizeCategorySelection(next);
    });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    setSearchParams((prev) => ({
      ...prev,
      page,
    }));
  };

  if (isCategoriesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[var(--color-ds-disabled)]">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="select-none min-h-full bg-[var(--color-ds-background)] dark:bg-navy-900 -mx-4 md:-mx-6 -my-6 md:-my-8">
      {showCategorySidebar && (
        <div
          className="fixed top-[140px] bottom-8 w-56 z-40"
          style={{ left: "max(16px, calc(50% - 678px))" }}
        >
          <CategorySection
            selectedId={selectedCategory}
            onSelect={handleCategorySelect}
            expandedIds={expandedIds}
            onToggleExpand={handleToggleExpand}
            categories={categories}
          />
        </div>
      )}

      <div
        className={`min-h-full flex justify-center [scrollbar-gutter:stable] ${
          showCategorySidebar
            ? "px-72"
            : showFilterSidebar
              ? "pr-72"
              : ""
        }`}
      >
        <div className="w-full max-w-4xl px-4 md:px-6 pt-4 md:pt-6 pb-4 md:pb-8">
          {showMobileFilter && (
            <div className="mb-4">
              <MobileFilterChips
                activeFilters={{
                  hasExactItemName: !!searchParams.isExactItemName,
                  hasCategory: selectedCategory !== "all",
                  hasPrice: !!(mobilePriceMin || mobilePriceMax),
                  hasDate: !!(mobileDateFrom || mobileDateTo),
                  hasOptions: mobileActiveFilters.length > 0,
                  hasEnchant: !!(mobileEnchantPrefix || mobileEnchantSuffix),
                }}
                onExactItemNameToggle={() => handleExactItemNameChange(!searchParams.isExactItemName)}
                onCategoryClick={() => setMobileFilterType("category")}
                onPriceClick={() => setMobileFilterType("price")}
                onDateClick={() => setMobileFilterType("date")}
                onOptionsClick={() => setMobileFilterType("options")}
                onEnchantClick={() => setMobileFilterType("enchant")}
              />
            </div>
          )}

          {showFilterSidebar && categoryPath.length > 0 && (
            <div className="mb-4 flex items-center gap-2 text-sm flex-wrap">
              <div className="2xl:hidden">
                <CategoryDropdown
                  isOpen={isCategoryDropdownOpen}
                  onToggle={() =>
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                  }
                  onClose={() => setIsCategoryDropdownOpen(false)}
                  selectedId={selectedCategory}
                  onSelect={handleCategorySelect}
                  expandedIds={expandedIds}
                  onToggleExpand={handleToggleExpand}
                  categories={categories}
                />
              </div>
              {categoryPath.map((p, index) => (
                <React.Fragment key={p.id}>
                  {index > 0 && <span className="text-cream-400">›</span>}
                  <Badge
                    className="rounded-full cursor-pointer bg-clover-50 text-clover-700 hover:bg-clover-100 border-0 font-medium"
                    onClick={() => handleCategorySelect(p.id)}
                  >
                    {p.name}
                  </Badge>
                </React.Fragment>
              ))}
            </div>
          )}

          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs md:text-sm text-[var(--color-ds-disabled)]">
                {itemName ? (
                  <>
                    <span className="font-semibold text-[var(--color-ds-primary)]">
                      {itemName}
                    </span>{" "}
                    검색결과
                    {resultCountNode}
                    개
                  </>
                ) : (
                  <>
                    검색결과
                    {resultCountNode}
                    개
                  </>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs md:text-sm text-[var(--color-ds-text)] hover:bg-[var(--color-ds-neutral-50)] rounded-xl transition-colors"
                >
                  <span className="font-medium">{selectedSortOption.label}</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isSortDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-xl border border-[var(--color-ds-neutral-tone)] py-2 z-50 min-w-[180px]">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.label}
                        onClick={() => {
                          setIsSortDropdownOpen(false);
                          setSearchParams((prev) => ({
                            ...prev,
                            sortBy: option.sortBy,
                            direction: option.direction,
                            page: 1,
                          }));
                        }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                          selectedSortOption.label === option.label
                            ? "bg-[var(--color-ds-primary-50)] text-[var(--color-ds-primary)] font-semibold"
                            : "text-[var(--color-ds-text)] hover:bg-[var(--color-ds-neutral-50)]"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <AuctionHistoryList items={allItems} isLoading={isLoading} />

            {isFetching && !isLoading && (
              <div className="h-12 flex items-center justify-center">
                <div className="text-sm text-[var(--color-ds-disabled)]">로딩 중...</div>
              </div>
            )}

            <ItemInfoPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      {showFilterSidebar && (
        <SearchFilterCard
          onFilterApply={handleFilterApply}
          isModal={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          layoutMode={layoutMode}
          isExactItemName={!!searchParams.isExactItemName}
          onExactItemNameChange={handleExactItemNameChange}
        />
      )}

      {showMobileFilter && (
        <MobileFilterModal
          isOpen={mobileFilterType !== null}
          onClose={() => setMobileFilterType(null)}
          filterType={mobileFilterType || "category"}
          initialData={{
            selectedCategory,
            priceMin: mobilePriceMin,
            priceMax: mobilePriceMax,
            dateFrom: mobileDateFrom,
            dateTo: mobileDateTo,
            activeFilters: mobileActiveFilters,
            enchantPrefix: mobileEnchantPrefix,
            enchantSuffix: mobileEnchantSuffix,
          }}
          categories={categories}
          onApply={handleMobileFilterApply}
        />
      )}

      <AlertDialog
        open={showExactItemNameWarning}
        onOpenChange={handleExactItemNameWarningOpenChange}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>아이템명 완전 일치 옵션 해제</AlertDialogTitle>
            <AlertDialogDescription>
              아이템명 완전 일치 옵션을 해제하면 검색 속도가 느려질 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={dontShowExactItemNameWarningAgain}
              onCheckedChange={(checked) =>
                setDontShowExactItemNameWarningAgain(checked === true)
              }
            />
            <span className="text-sm text-[var(--color-ds-text)]">
              메시지 다시 보지 않기
            </span>
          </label>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDisableExactItemName}>
              동의하고 해제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
