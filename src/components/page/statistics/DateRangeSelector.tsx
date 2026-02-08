"use client";

interface DateRangeSelectorProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
  maxRange?: string;
}

export default function DateRangeSelector({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  maxRange,
}: DateRangeSelectorProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {maxRange ?? "조회 기간"}
      </span>
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => onDateFromChange(e.target.value)}
        max={dateTo || today}
        className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blaanid-500/20 dark:focus:ring-coral-500/20"
      />
      <span className="text-gray-400">~</span>
      <input
        type="date"
        value={dateTo}
        onChange={(e) => onDateToChange(e.target.value)}
        min={dateFrom}
        max={today}
        className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blaanid-500/20 dark:focus:ring-coral-500/20"
      />
    </div>
  );
}
