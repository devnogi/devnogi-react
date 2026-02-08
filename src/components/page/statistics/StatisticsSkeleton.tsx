"use client";

export default function StatisticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-navy-700 rounded-2xl p-4 shadow-xl border border-gray-100 dark:border-navy-600"
          >
            <div className="h-3 w-12 bg-gray-200 dark:bg-navy-600 rounded mb-2" />
            <div className="h-6 w-20 bg-gray-200 dark:bg-navy-600 rounded" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-white dark:bg-navy-700 rounded-2xl p-4 md:p-6 shadow-xl border border-gray-100 dark:border-navy-600">
        <div className="h-4 w-20 bg-gray-200 dark:bg-navy-600 rounded mb-4" />
        <div className="h-[200px] md:h-[300px] lg:h-[350px] bg-gray-100 dark:bg-navy-600/50 rounded-xl" />
      </div>

      {/* Volume Chart Skeleton */}
      <div className="bg-white dark:bg-navy-700 rounded-2xl p-4 md:p-6 shadow-xl border border-gray-100 dark:border-navy-600">
        <div className="h-4 w-16 bg-gray-200 dark:bg-navy-600 rounded mb-4" />
        <div className="h-[200px] md:h-[300px] lg:h-[350px] bg-gray-100 dark:bg-navy-600/50 rounded-xl" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-navy-700 rounded-2xl p-4 md:p-6 shadow-xl border border-gray-100 dark:border-navy-600">
        <div className="h-4 w-24 bg-gray-200 dark:bg-navy-600 rounded mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 dark:bg-navy-600/50 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
