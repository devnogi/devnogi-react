"use client";

import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { Board, ApiResponse, BoardListData } from "@/types/community";
import CategorySkeleton from "./CategorySkeleton";
import DataFetchError from "@/components/commons/DataFetchError";

interface CategoryProps {
  selectedBoardId: number | undefined;
  setSelectedBoardId: (boardId: number | undefined) => void;
}

function Category({ selectedBoardId, setSelectedBoardId }: CategoryProps) {
  const [categories, setCategories] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBoards = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/boards");
      if (!response.ok) {
        throw new Error(
          `Failed to fetch boards: ${response.status} ${response.statusText}`,
        );
      }
      const apiResponse: ApiResponse<BoardListData> = await response.json();

      // API 응답 구조 확인
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || "Failed to fetch boards");
      }

      // data.boards 배열 추출
      const boards = apiResponse.data?.boards || [];
      setCategories(boards);
    } catch (err) {
      const fetchError =
        err instanceof Error ? err : new Error("Unknown error");
      setError(fetchError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  // 로딩 중일 때 Skeleton UI 표시
  if (loading) {
    return <CategorySkeleton />;
  }

  // 에러 발생 시 DataFetchError 표시
  if (error) {
    return (
      <DataFetchError
        message="카테고리 데이터를 받아오지 못 하였습니다"
        onRetry={fetchBoards}
        showRetry={true}
        className="py-4"
      />
    );
  }

  return (
    <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {/* 전체 버튼 */}
      <button
        onClick={() => setSelectedBoardId(undefined)}
        className={clsx(
          "px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0",
          selectedBoardId === undefined
            ? "bg-[var(--color-ds-primary)] text-white shadow-md"
            : "bg-white dark:bg-navy-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-navy-600 hover:bg-gray-50 dark:hover:bg-navy-600"
        )}
      >
        전체
      </button>

      {/* 카테고리별 게시판 */}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => setSelectedBoardId(category.id)}
          className={clsx(
            "px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 relative group",
            selectedBoardId === category.id
              ? "bg-[var(--color-ds-primary)] text-white shadow-md"
              : "bg-white dark:bg-navy-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-navy-600 hover:bg-gray-50 dark:hover:bg-navy-600"
          )}
        >
          <span>{category.name}</span>
          {/* 툴팁 */}
          <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-10 shadow-lg">
            <div>{category.description}</div>
            <div className="text-gray-400 text-[10px] mt-1">
              {category.topCategory} &gt; {category.subCategory}
            </div>
            {/* 화살표 */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800" />
          </div>
        </button>
      ))}
    </div>
  );
}

export default Category;
