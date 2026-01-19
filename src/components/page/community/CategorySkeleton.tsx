/**
 * Category 로딩 시 표시되는 Skeleton UI
 */
export default function CategorySkeleton() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"
        />
      ))}
    </div>
  );
}
