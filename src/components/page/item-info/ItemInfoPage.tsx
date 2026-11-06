"use client";

import { ArrowUpDown, Info } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useItemInfoCategories } from "@/hooks/useItemInfoCategories";
import { useItemInfoDetail } from "@/hooks/useItemInfoDetail";
import { ItemInfoSearchParams } from "@/types/item-info";

import ItemInfoCategoryFilter from "./ItemInfoCategoryFilter";
import ItemInfoPagination from "./ItemInfoPagination";
import ItemInfoTable from "./ItemInfoTable";

const PAGE_SIZE = 20;
const DEFAULT_SORT_DIRECTION: "ASC" | "DESC" = "ASC";

function parsePositiveInt(raw: string | null, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function parseSortDirection(raw: string | null): "ASC" | "DESC" {
  if (!raw) return DEFAULT_SORT_DIRECTION;
  return raw.toUpperCase() === "DESC" ? "DESC" : "ASC";
}

export default function ItemInfoPage() {
  const router = useRouter();
  const pathname = usePathname();
  const urlSearchParams = useSearchParams();
  const { data: categories = [], isLoading: isCategoriesLoading } =
    useItemInfoCategories();
  const topCategory =
    urlSearchParams.get("top_category") ||
    urlSearchParams.get("topCategory") ||
    categories[0]?.topCategory ||
    "";
  const subCategory =
    urlSearchParams.get("sub_category") ||
    urlSearchParams.get("subCategory") ||
    "";
  const appliedName =
    urlSearchParams.get("item_name") ||
    urlSearchParams.get("itemName") ||
    urlSearchParams.get("name") ||
    "";
  const currentPage = parsePositiveInt(urlSearchParams.get("page"), 1);
  const sortDirection = parseSortDirection(urlSearchParams.get("direction"));

  function updateQuery(changes: Record<string, string>) {
    const values = {
      top_category: topCategory,
      sub_category: subCategory,
      item_name: appliedName,
      page: currentPage > 1 ? String(currentPage) : "",
      direction: sortDirection === "DESC" ? sortDirection : "",
      ...changes,
    };
    const query = new URLSearchParams(
      Object.entries(values).filter(([, value]) => value),
    );
    router.replace(query.size ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const searchParams: ItemInfoSearchParams | null = topCategory
    ? {
        topCategory,
        subCategory: subCategory || undefined,
        name: appliedName || undefined,
        page: currentPage,
        size: PAGE_SIZE,
        direction: sortDirection,
      }
    : null;

  const {
    data: pageData,
    isLoading,
    isFetching,
  } = useItemInfoDetail(searchParams);

  if (isCategoriesLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-ds-background)] dark:bg-navy-900 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[var(--color-ds-neutral-100)] rounded-lg w-1/3" />
            <div className="h-12 bg-[var(--color-ds-neutral-100)] rounded-lg" />
            <div className="h-24 bg-[var(--color-ds-neutral-100)] rounded-lg" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-14 bg-[var(--color-ds-neutral-100)] rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-ds-background)] dark:bg-navy-900 -mx-4 md:-mx-6 -my-6 md:-my-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
        <h1 className="text-xl font-bold text-[var(--color-ds-text)] md:text-2xl">
          아이템 도감
        </h1>
        {/* Category Filter */}
        <ItemInfoCategoryFilter
          categories={categories}
          selectedTopCategory={topCategory}
          selectedSubCategory={subCategory}
          onTopCategoryChange={(category) =>
            updateQuery({ top_category: category, sub_category: "", page: "" })
          }
          onSubCategoryChange={(category) =>
            updateQuery({ sub_category: category, page: "" })
          }
        />

        {/* Results Info & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="w-4 h-4 text-[var(--color-ds-disabled)]" />
            <span>
              {pageData ? (
                <>
                  총{" "}
                  <span className="font-semibold text-[var(--color-ds-text)]">
                    {pageData.totalElements}
                  </span>
                  개의 아이템
                </>
              ) : (
                "카테고리를 선택해주세요"
              )}
            </span>
            {isFetching && (
              <span className="ml-2 text-[var(--color-ds-primary)]">
                로딩 중...
              </span>
            )}
          </div>

          <button
            onClick={() =>
              updateQuery({
                direction: sortDirection === "ASC" ? "DESC" : "",
                page: "",
              })
            }
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-ds-secondary)] hover:bg-[var(--color-ds-neutral-100)] transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
            이름순 {sortDirection === "ASC" ? "오름차순" : "내림차순"}
          </button>
        </div>

        {/* Table */}
        <ItemInfoTable items={pageData?.content || []} isLoading={isLoading} />

        {/* Pagination */}
        {pageData && (
          <ItemInfoPagination
            currentPage={currentPage}
            totalPages={pageData.totalPages}
            totalElements={pageData.totalElements}
            pageSize={PAGE_SIZE}
            onPageChange={(page) => {
              updateQuery({ page: page > 1 ? String(page) : "" });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}
      </div>
    </div>
  );
}
