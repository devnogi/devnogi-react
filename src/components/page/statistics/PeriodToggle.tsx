"use client";

import clsx from "clsx";

export type PeriodType = "daily" | "weekly";

interface PeriodToggleProps {
  period: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
}

export default function PeriodToggle({
  period,
  onPeriodChange,
}: PeriodToggleProps) {
  return (
    <div className="inline-flex rounded-xl bg-gray-100 dark:bg-navy-700 p-1">
      <button
        onClick={() => onPeriodChange("daily")}
        className={clsx(
          "px-4 py-1.5 text-sm font-medium rounded-lg transition-all",
          period === "daily"
            ? "bg-white dark:bg-navy-600 text-blaanid-600 dark:text-coral-400 shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
        )}
      >
        일간
      </button>
      <button
        onClick={() => onPeriodChange("weekly")}
        className={clsx(
          "px-4 py-1.5 text-sm font-medium rounded-lg transition-all",
          period === "weekly"
            ? "bg-white dark:bg-navy-600 text-blaanid-600 dark:text-coral-400 shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
        )}
      >
        주간
      </button>
    </div>
  );
}
