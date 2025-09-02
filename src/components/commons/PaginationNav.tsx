import { useMemo } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationNextStep, PaginationPrevious, PaginationPreviousStep } from "@/components/ui/pagination";

export default function PaginationNav({
    currentPage,
    totalPages,
    onPageChange,
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    const { visiblePages, canGoPrevious, canGoNext } = useMemo(() => {
        const delta = 5;
        const pages = [];
        
        let startPage = Math.max(1, currentPage - delta);
        let endPage = Math.min(totalPages, currentPage + delta);
        
        if (endPage - startPage < 10) {
            if (startPage === 1) {
                endPage = Math.min(totalPages, startPage + 10);
            } else {
                startPage = Math.max(1, endPage - 10);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        
        return {
            visiblePages: pages,
            canGoPrevious: currentPage > 1,
            canGoNext: currentPage < totalPages,
        };
    }, [currentPage, totalPages]);

    return (
      <Pagination>
        <PaginationContent>
          {/* 이전 페이지 이동 */}
          <PaginationItem>
            <PaginationPreviousStep
              href="#"
              onClick={canGoPrevious ? () => onPageChange(visiblePages[0]) : undefined}
              className={!canGoPrevious ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={canGoPrevious ? () => onPageChange(currentPage - 1) : undefined}
              className={!canGoPrevious ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {/* 페이지 선택 */}
          {visiblePages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink 
                href="#" 
                isActive={page === currentPage}
                onClick={() => onPageChange(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          {/* 다음 페이지 이동 */}
          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={canGoNext ? () => onPageChange(currentPage + 1) : undefined}
              className={!canGoNext ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNextStep 
              href="#" 
              onClick={canGoNext ? () => onPageChange(visiblePages[visiblePages.length - 1]) : undefined}
              className={!canGoNext ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
}