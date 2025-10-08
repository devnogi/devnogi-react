"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Board, ApiResponse, BoardListData } from "@/types/community";

interface CategoryProps {
  selectedBoardId: number | undefined;
  setSelectedBoardId: (boardId: number | undefined) => void;
}

function Category({ selectedBoardId, setSelectedBoardId }: CategoryProps) {
  const [categories, setCategories] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchBoards() {
      try {
        const response = await fetch("/api/boards");
        if (!response.ok) {
          throw new Error(`Failed to fetch boards: ${response.status} ${response.statusText}`);
        }
        const apiResponse: ApiResponse<BoardListData> = await response.json();

        // API 응답 구조 확인
        if (!apiResponse.success) {
          throw new Error(apiResponse.message || "Failed to fetch boards");
        }

        // data.boards 배열 추출
        const boards = apiResponse.data?.boards || [];
        setCategories(boards);
      } catch (error) {
        console.error("Error fetching boards:", error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchBoards();
  }, []);

  if (loading) {
    return (
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-9 w-20 bg-gray-200 rounded animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">카테고리를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {/* 전체 버튼 */}
      <Button
        variant={selectedBoardId === undefined ? "default" : "outline"}
        onClick={() => setSelectedBoardId(undefined)}
        className="flex-shrink-0"
      >
        전체
      </Button>

      {/* 카테고리별 게시판 */}
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedBoardId === category.id ? "default" : "outline"}
          onClick={() => setSelectedBoardId(category.id)}
          className="flex-shrink-0 relative group"
        >
          <span>{category.name}</span>
          {/* 툴팁 */}
          <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
            <div>{category.description}</div>
            <div className="text-gray-400 text-[10px] mt-1">
              {category.topCategory} &gt; {category.subCategory}
            </div>
            {/* 화살표 */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
          </div>
        </Button>
      ))}
    </div>
  );
}

export default Category;
