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
    <div className="inline-flex rounded-lg bg-gray-100 dark:bg-navy-700 p-1">
      <button
        aria-pressed={period === "daily"}
        onClick={() => onPeriodChange("daily")}
        className={clsx(
          "min-h-11 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ds-primary)]",
          period === "daily"
            ? "bg-[var(--color-ds-primary-50)] text-[var(--color-ds-primary)] underline underline-offset-4"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
        )}
      >
        일간
      </button>
      <button
        aria-pressed={period === "weekly"}
        onClick={() => onPeriodChange("weekly")}
        className={clsx(
          "min-h-11 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ds-primary)]",
          period === "weekly"
            ? "bg-[var(--color-ds-primary-50)] text-[var(--color-ds-primary)] underline underline-offset-4"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
        )}
      >
        주간
      </button>
    </div>
  );
}
