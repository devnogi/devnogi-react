"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * 경매장 거래 내역 화면 레이아웃 모드
 * - desktop: 3-column (왼쪽 카테고리 + 중앙 콘텐츠 + 오른쪽 필터)
 * - tablet: 2-column (중앙 콘텐츠 + 오른쪽 필터) 또는 모바일 필터
 * - mobile: 1-column (중앙 콘텐츠 + 모바일 UI)
 */
export type LayoutMode = "desktop" | "tablet" | "mobile";

// 레이아웃 상수
const LAYOUT_CONSTANTS = {
  // 컴포넌트 너비 (Tailwind 클래스 기준)
  MAIN_CONTENT_MAX_WIDTH: 896, // max-w-4xl
  CATEGORY_WIDTH: 224, // w-56
  FILTER_WIDTH_XL: 240, // w-60
  FILTER_WIDTH_2XL: 256, // w-64

  // 사이드바 상단 위치 (네비게이션 아래)
  // 카테고리와 필터 컴포넌트가 동일한 높이에 정렬되도록 통일
  SIDEBAR_TOP: 140, // top-[140px]

  // 간격 (데스크탑/태블릿 분리)
  DESKTOP_GAP: 6, // 데스크탑 3-column 레이아웃용 (더 조밀하게)
  TABLET_GAP: 24, // 태블릿 2-column 레이아웃용 (기존 값 유지)
  SAFE_MARGIN: 32, // 양쪽 최소 여백 16px * 2

  // 브레이크포인트
  // 3-column: 메인 + 카테고리 + 필터 + 간격 + 마진
  // = 896 + 224 + 256 + (6*2) + 32 = 1420px, 안전 마진 포함 1452px
  DESKTOP_MIN_WIDTH: 1452,

  // 2-column: 메인 + 필터 + 간격 + 마진
  // = 896 + 240 + 24 + 32 = 1192px, 안전 마진 포함 1240px
  TABLET_MIN_WIDTH: 1240,

  // 기존 Tailwind 브레이크포인트
  TAILWIND_XL: 1280,
  TAILWIND_2XL: 1536,
} as const;

interface UseAuctionHistoryLayoutReturn {
  /** 현재 레이아웃 모드 */
  layoutMode: LayoutMode;
  /** 카테고리 사이드바 표시 여부 */
  showCategorySidebar: boolean;
  /** 필터 사이드바 표시 여부 */
  showFilterSidebar: boolean;
  /** 모바일 필터 UI 표시 여부 */
  showMobileFilter: boolean;
  /** 현재 화면 너비 */
  windowWidth: number;
  /** 겹침 위험 여부 (디버깅용) */
  hasOverlapRisk: boolean;
}

/**
 * 경매장 거래 내역 화면의 레이아웃 모드를 관리하는 훅
 *
 * 화면 크기에 따라 자동으로 레이아웃을 조정하며,
 * 컴포넌트 간 겹침이 발생할 수 있는 경우 자동으로 태블릿/모바일 뷰로 전환합니다.
 */
export function useAuctionHistoryLayout(): UseAuctionHistoryLayoutReturn {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : LAYOUT_CONSTANTS.TAILWIND_2XL
  );

  const calculateLayoutMode = useCallback((width: number): LayoutMode => {
    // 3-column 레이아웃에 필요한 최소 너비 확인
    if (width >= LAYOUT_CONSTANTS.DESKTOP_MIN_WIDTH) {
      return "desktop";
    }

    // 2-column 레이아웃에 필요한 최소 너비 확인
    if (width >= LAYOUT_CONSTANTS.TABLET_MIN_WIDTH) {
      return "tablet";
    }

    return "mobile";
  }, []);

  const checkOverlapRisk = useCallback((width: number): boolean => {
    // 현재 Tailwind 브레이크포인트 기준으로 표시되는 컴포넌트 확인
    const showCategory = width >= LAYOUT_CONSTANTS.TAILWIND_2XL;
    const showFilter = width >= LAYOUT_CONSTANTS.TAILWIND_XL;

    if (showCategory && showFilter) {
      // 3-column 모드(데스크탑)에서 겹침 확인 - DESKTOP_GAP 사용
      const requiredWidth =
        LAYOUT_CONSTANTS.MAIN_CONTENT_MAX_WIDTH +
        LAYOUT_CONSTANTS.CATEGORY_WIDTH +
        LAYOUT_CONSTANTS.FILTER_WIDTH_2XL +
        LAYOUT_CONSTANTS.DESKTOP_GAP * 2 +
        LAYOUT_CONSTANTS.SAFE_MARGIN;
      return width < requiredWidth;
    }

    if (showFilter) {
      // 2-column 모드(태블릿)에서 겹침 확인 - TABLET_GAP 사용
      const requiredWidth =
        LAYOUT_CONSTANTS.MAIN_CONTENT_MAX_WIDTH +
        LAYOUT_CONSTANTS.FILTER_WIDTH_XL +
        LAYOUT_CONSTANTS.TABLET_GAP +
        LAYOUT_CONSTANTS.SAFE_MARGIN;
      return width < requiredWidth;
    }

    return false;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // debounce resize events
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener("resize", debouncedResize);

    // 초기값 설정
    handleResize();

    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const layoutMode = calculateLayoutMode(windowWidth);
  const hasOverlapRisk = checkOverlapRisk(windowWidth);

  // 겹침 위험이 있으면 강제로 한 단계 낮은 레이아웃 모드 사용
  const effectiveLayoutMode: LayoutMode = hasOverlapRisk
    ? layoutMode === "desktop"
      ? "tablet"
      : "mobile"
    : layoutMode;

  return {
    layoutMode: effectiveLayoutMode,
    showCategorySidebar: effectiveLayoutMode === "desktop",
    showFilterSidebar: effectiveLayoutMode === "desktop" || effectiveLayoutMode === "tablet",
    showMobileFilter: effectiveLayoutMode === "mobile",
    windowWidth,
    hasOverlapRisk,
  };
}

// 레이아웃 상수 내보내기 (테스트 및 스타일링에 활용)
export { LAYOUT_CONSTANTS };
