"use client";

import { useMemo, useState } from "react";
import { useItemOptionInfos } from "@/hooks/useItemOptionInfos";
import { ItemOptionInfo, ItemOptionInfoGroup } from "@/types/item-option-info";
import ItemOptionSearchBar from "./ItemOptionSearchBar";
import ItemOptionFilterTabs, { FILTER_TABS } from "./ItemOptionFilterTabs";
import ItemOptionGroupCard from "./ItemOptionGroupCard";
import { Info } from "lucide-react";

function groupByOptionType(items: ItemOptionInfo[]): ItemOptionInfoGroup[] {
  const grouped = items.reduce(
    (acc, item) => {
      const type = item.optionType || "기타";
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(item);
      return acc;
    },
    {} as Record<string, ItemOptionInfo[]>
  );

  return Object.entries(grouped)
    .map(([optionType, items]) => ({
      optionType,
      items,
    }))
    .sort((a, b) => a.optionType.localeCompare(b.optionType));
}

function filterByTab(
  groups: ItemOptionInfoGroup[],
  tabId: string
): ItemOptionInfoGroup[] {
  if (tabId === "all") return groups;

  const tab = FILTER_TABS.find((t) => t.id === tabId);
  if (!tab || tab.keywords.length === 0) {
    if (tabId === "etc") {
      const usedKeywords = FILTER_TABS.filter((t) => t.id !== "all" && t.id !== "etc")
        .flatMap((t) => t.keywords);
      return groups.filter(
        (group) =>
          !usedKeywords.some(
            (keyword) =>
              group.optionType.includes(keyword) ||
              group.items.some((item) => item.optionDesc?.includes(keyword))
          )
      );
    }
    return groups;
  }

  return groups.filter(
    (group) =>
      tab.keywords.some(
        (keyword) =>
          group.optionType.includes(keyword) ||
          group.items.some((item) => item.optionDesc?.includes(keyword))
      )
  );
}

function filterBySearch(
  groups: ItemOptionInfoGroup[],
  searchQuery: string
): ItemOptionInfoGroup[] {
  if (!searchQuery.trim()) return groups;

  const query = searchQuery.toLowerCase();

  return groups
    .map((group) => {
      if (group.optionType.toLowerCase().includes(query)) {
        return group;
      }

      const filteredItems = group.items.filter(
        (item) =>
          item.optionType.toLowerCase().includes(query) ||
          item.optionSubType?.toLowerCase().includes(query) ||
          item.optionValue?.toLowerCase().includes(query) ||
          item.optionValue2?.toLowerCase().includes(query) ||
          item.optionDesc?.toLowerCase().includes(query)
      );

      if (filteredItems.length === 0) return null;

      return {
        ...group,
        items: filteredItems,
      };
    })
    .filter((group): group is ItemOptionInfoGroup => group !== null);
}

export default function ItemOptionInfoPage() {
  const { data: items = [], isLoading, error } = useItemOptionInfos();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");

  const groupedItems = useMemo(() => groupByOptionType(items), [items]);

  const filteredGroups = useMemo(() => {
    let result = groupedItems;
    result = filterByTab(result, selectedTab);
    result = filterBySearch(result, searchQuery);
    return result;
  }, [groupedItems, selectedTab, searchQuery]);

  const totalCount = filteredGroups.reduce(
    (sum, group) => sum + group.items.length,
    0
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-ds-background)] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[var(--color-ds-neutral-100)] rounded-lg w-1/3" />
            <div className="h-12 bg-[var(--color-ds-neutral-100)] rounded-xl" />
            <div className="h-10 bg-[var(--color-ds-neutral-100)] rounded-xl w-2/3" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-[var(--color-ds-neutral-100)] rounded-2xl"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-ds-background)] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
            <p className="text-rose-700 font-medium">
              데이터를 불러오는 중 오류가 발생했습니다.
            </p>
            <p className="text-rose-600 text-sm mt-2">
              잠시 후 다시 시도해주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-ds-background)] py-6 md:py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-ds-text)]">
            아이템 옵션 정보
          </h1>
          <p className="mt-2 text-sm md:text-base text-[var(--color-ds-secondary)]">
            마비노기 아이템에 부여되는 모든 옵션 효과를 확인하세요.
          </p>
        </div>

        {/* Search */}
        <ItemOptionSearchBar value={searchQuery} onChange={setSearchQuery} />

        {/* Filter Tabs */}
        <ItemOptionFilterTabs
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
        />

        {/* Results Count */}
        <div className="flex items-center gap-2 text-sm text-[var(--color-ds-disabled)]">
          <Info className="w-4 h-4" />
          <span>
            총 <span className="font-semibold text-[var(--color-ds-text)]">{totalCount}</span>개의 옵션이 있습니다.
          </span>
        </div>

        {/* Groups */}
        {filteredGroups.length > 0 ? (
          <div className="space-y-4">
            {filteredGroups.map((group) => (
              <ItemOptionGroupCard
                key={group.optionType}
                group={group}
                defaultExpanded={filteredGroups.length <= 5}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[var(--color-ds-neutral-tone)] p-8 text-center">
            <p className="text-[var(--color-ds-disabled)]">
              검색 결과가 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
