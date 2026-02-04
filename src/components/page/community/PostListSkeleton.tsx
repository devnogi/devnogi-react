/**
 * PostList 로딩 시 표시되는 Skeleton UI
 * PostCard와 동일한 레이아웃 구조를 유지
 */
export default function PostListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-navy-700 rounded-[20px] border border-gray-200 dark:border-navy-600 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] p-5 flex flex-col animate-pulse"
        >
          {/* Title skeleton */}
          <div className="flex-1 min-h-[48px] space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-navy-600 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-navy-600 rounded w-3/4" />
          </div>

          {/* Stats & Time skeleton */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-navy-600">
            <div className="flex items-center justify-between">
              {/* Stats */}
              <div className="flex items-center gap-3">
                <div className="h-4 w-12 bg-gray-200 dark:bg-navy-600 rounded" />
                <div className="h-4 w-12 bg-gray-200 dark:bg-navy-600 rounded" />
                <div className="h-4 w-12 bg-gray-200 dark:bg-navy-600 rounded" />
              </div>

              {/* Time */}
              <div className="h-3 w-16 bg-gray-200 dark:bg-navy-600 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
