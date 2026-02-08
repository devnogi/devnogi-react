"use client";

import clsx from "clsx";

export type StatisticsTabType = "item" | "subcategory" | "top-category";

interface StatisticsTabsProps {
  activeTab: StatisticsTabType;
  onTabChange: (tab: StatisticsTabType) => void;
}

const tabs: { id: StatisticsTabType; label: string }[] = [
  { id: "item", label: "아이템 시세" },
  { id: "subcategory", label: "카테고리 시세" },
  { id: "top-category", label: "전체 카테고리 시세" },
];

export default function StatisticsTabs({
  activeTab,
  onTabChange,
}: StatisticsTabsProps) {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-1 min-w-max md:gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              "px-4 py-2 text-sm font-medium rounded-xl transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-blaanid-500 dark:bg-coral-500 text-white shadow-lg"
                : "bg-white dark:bg-navy-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-600 border border-gray-200 dark:border-navy-600",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
