"use client";

export default function RankingCardSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-navy-700/50 animate-pulse"
        >
          <div className="w-6 h-6 bg-gray-200 dark:bg-navy-600 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-navy-600 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-navy-600 rounded w-1/2" />
          </div>
          <div className="h-5 bg-gray-200 dark:bg-navy-600 rounded w-16" />
        </div>
      ))}
    </div>
  );
}
