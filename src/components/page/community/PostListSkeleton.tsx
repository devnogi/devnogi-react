/**
 * PostList 로딩 시 표시되는 Skeleton UI
 * PostCard와 동일한 레이아웃 구조를 유지
 */
export default function PostListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white/95 dark:bg-navy-700/95 rounded-2xl border border-gray-200 dark:border-navy-600 p-4 animate-pulse"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-navy-600" />
            <div className="space-y-1.5">
              <div className="h-3.5 bg-gray-200 dark:bg-navy-600 rounded w-20" />
              <div className="h-3 bg-gray-200 dark:bg-navy-600 rounded w-16" />
            </div>
          </div>

          <div className="space-y-2 mb-3">
            <div className="h-4 bg-gray-200 dark:bg-navy-600 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-navy-600 rounded w-4/5" />
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-navy-600">
            <div className="flex items-center gap-2">
              <div className="h-6 w-14 bg-gray-200 dark:bg-navy-600 rounded-full" />
              <div className="h-6 w-14 bg-gray-200 dark:bg-navy-600 rounded-full" />
              <div className="h-6 w-14 bg-gray-200 dark:bg-navy-600 rounded-full ml-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
