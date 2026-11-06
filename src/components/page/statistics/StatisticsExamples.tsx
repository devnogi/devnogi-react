"use client";

import { useItemCategories } from "@/hooks/useItemCategories";
import { useTodayPopularRanking } from "@/hooks/useRankings";
import type { ItemStatisticsParams } from "@/types/statistics";

interface StatisticsExamplesProps {
  onSearch: (params: ItemStatisticsParams) => void;
}

export default function StatisticsExamples({
  onSearch,
}: StatisticsExamplesProps) {
  const { data: rankings = [], error, isLoading } = useTodayPopularRanking(7);
  const { data: categories = [] } = useItemCategories();
  const topCategories =
    categories.find(
      (category) => category.id === "all" && category.children?.length,
    )?.children ?? categories.filter((category) => category.id !== "all");
  const examples = rankings
    .filter((item) => {
      if (
        !item.itemName.trim() ||
        !item.itemTopCategory.trim() ||
        !item.itemSubCategory.trim()
      ) {
        return false;
      }
      return topCategories.some(
        (category) =>
          category.name === item.itemTopCategory &&
          category.children?.some(
            (child) => child.name === item.itemSubCategory,
          ),
      );
    })
    .slice(0, 3);

  if (isLoading || error || examples.length === 0) return null;

  return (
    <section aria-label="인기 아이템으로 시세 조회" className="mt-5">
      <h2 className="text-sm font-medium text-[var(--color-ds-text)]">
        인기 아이템으로 시작해보세요
      </h2>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {examples.map((item) => (
          <button
            key={`${item.itemTopCategory}/${item.itemSubCategory}/${item.itemName}`}
            type="button"
            aria-label={`${item.itemName} 시세 조회`}
            onClick={() =>
              onSearch({
                itemName: item.itemName,
                topCategory: item.itemTopCategory,
                subCategory: item.itemSubCategory,
              })
            }
            className="min-h-11 rounded-lg border border-[var(--color-ds-neutral-tone)] bg-[var(--color-ds-primary-50)] px-4 py-2 text-sm font-medium text-[var(--color-ds-primary)] transition-colors hover:bg-[var(--color-ds-primary-100)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ds-primary)]"
          >
            {item.itemName}
          </button>
        ))}
      </div>
    </section>
  );
}
