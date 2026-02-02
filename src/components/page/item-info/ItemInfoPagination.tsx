"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface ItemInfoPaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function ItemInfoPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ItemInfoPaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages: (number | "...")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex justify-center py-4">
      {/* 페이지 버튼 */}
      <div className="flex items-center gap-1">
        {/* 첫 페이지 */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={clsx(
            "p-2 rounded-lg transition-colors",
            currentPage === 1
              ? "text-[var(--color-ds-disabled)] cursor-not-allowed"
              : "text-[var(--color-ds-secondary)] hover:bg-[var(--color-ds-neutral-100)]",
          )}
          aria-label="첫 페이지"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* 이전 페이지 */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={clsx(
            "p-2 rounded-lg transition-colors",
            currentPage === 1
              ? "text-[var(--color-ds-disabled)] cursor-not-allowed"
              : "text-[var(--color-ds-secondary)] hover:bg-[var(--color-ds-neutral-100)]",
          )}
          aria-label="이전 페이지"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* 페이지 번호 */}
        {getVisiblePages().map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 py-1 text-[var(--color-ds-disabled)]"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={clsx(
                "min-w-[32px] md:min-w-[36px] h-8 md:h-9 px-2 md:px-3 rounded-lg text-xs md:text-sm font-medium transition-colors",
                currentPage === page
                  ? "bg-[var(--color-ds-primary)] text-white"
                  : "text-[var(--color-ds-text)] hover:bg-[var(--color-ds-neutral-100)]",
              )}
            >
              {page}
            </button>
          ),
        )}

        {/* 다음 페이지 */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={clsx(
            "p-2 rounded-lg transition-colors",
            currentPage === totalPages
              ? "text-[var(--color-ds-disabled)] cursor-not-allowed"
              : "text-[var(--color-ds-secondary)] hover:bg-[var(--color-ds-neutral-100)]",
          )}
          aria-label="다음 페이지"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* 마지막 페이지 */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={clsx(
            "p-2 rounded-lg transition-colors",
            currentPage === totalPages
              ? "text-[var(--color-ds-disabled)] cursor-not-allowed"
              : "text-[var(--color-ds-secondary)] hover:bg-[var(--color-ds-neutral-100)]",
          )}
          aria-label="마지막 페이지"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
