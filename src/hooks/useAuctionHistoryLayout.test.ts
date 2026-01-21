import { renderHook, act } from "@testing-library/react";
import { useAuctionHistoryLayout, LAYOUT_CONSTANTS } from "./useAuctionHistoryLayout";

// window.innerWidth를 모킹하기 위한 헬퍼
const mockWindowWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  // resize 이벤트 발생
  window.dispatchEvent(new Event("resize"));
};

describe("useAuctionHistoryLayout", () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    // 원래 값 복원
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  describe("레이아웃 모드 결정", () => {
    it("데스크탑 화면 너비(1452px 이상)에서 desktop 모드를 반환한다", () => {
      mockWindowWidth(1600);
      const { result } = renderHook(() => useAuctionHistoryLayout());

      act(() => {
        jest.advanceTimersByTime(150); // debounce 대기
      });

      expect(result.current.layoutMode).toBe("desktop");
      expect(result.current.showCategorySidebar).toBe(true);
      expect(result.current.showFilterSidebar).toBe(true);
      expect(result.current.showMobileFilter).toBe(false);
    });

    it("태블릿 화면 너비(1240px~1452px)에서 tablet 모드를 반환한다", () => {
      mockWindowWidth(1300);
      const { result } = renderHook(() => useAuctionHistoryLayout());

      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(result.current.layoutMode).toBe("tablet");
      expect(result.current.showCategorySidebar).toBe(false);
      expect(result.current.showFilterSidebar).toBe(true);
      expect(result.current.showMobileFilter).toBe(false);
    });

    it("모바일 화면 너비(1240px 미만)에서 mobile 모드를 반환한다", () => {
      mockWindowWidth(1000);
      const { result } = renderHook(() => useAuctionHistoryLayout());

      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(result.current.layoutMode).toBe("mobile");
      expect(result.current.showCategorySidebar).toBe(false);
      expect(result.current.showFilterSidebar).toBe(false);
      expect(result.current.showMobileFilter).toBe(true);
    });
  });

  describe("화면 크기 변경 대응", () => {
    it("화면 크기가 줄어들면 레이아웃 모드가 변경된다", () => {
      mockWindowWidth(1600);
      const { result } = renderHook(() => useAuctionHistoryLayout());

      act(() => {
        jest.advanceTimersByTime(150);
      });
      expect(result.current.layoutMode).toBe("desktop");

      // 화면 크기 축소
      act(() => {
        mockWindowWidth(1200);
        jest.advanceTimersByTime(150);
      });

      expect(result.current.layoutMode).toBe("mobile");
    });

    it("화면 크기가 커지면 레이아웃 모드가 변경된다", () => {
      mockWindowWidth(1000);
      const { result } = renderHook(() => useAuctionHistoryLayout());

      act(() => {
        jest.advanceTimersByTime(150);
      });
      expect(result.current.layoutMode).toBe("mobile");

      // 화면 크기 확대
      act(() => {
        mockWindowWidth(1600);
        jest.advanceTimersByTime(150);
      });

      expect(result.current.layoutMode).toBe("desktop");
    });
  });

  describe("겹침 위험 감지", () => {
    it("3-column 모드에서 필요 너비보다 작으면 겹침 위험을 감지한다", () => {
      // Tailwind 2xl (1536px)이지만 실제 필요 너비(~1456px)보다 작은 경우
      mockWindowWidth(LAYOUT_CONSTANTS.TAILWIND_2XL);
      const { result } = renderHook(() => useAuctionHistoryLayout());

      act(() => {
        jest.advanceTimersByTime(150);
      });

      // 1536px에서는 Tailwind 기준 3-column이 되어야 하지만
      // 겹침 확인 로직에 의해 desktop으로 유지됨 (1536 > 1456)
      expect(result.current.showCategorySidebar).toBe(true);
    });

    it("경계값에서 올바르게 동작한다", () => {
      // 정확히 DESKTOP_MIN_WIDTH
      mockWindowWidth(LAYOUT_CONSTANTS.DESKTOP_MIN_WIDTH);
      const { result } = renderHook(() => useAuctionHistoryLayout());

      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(result.current.layoutMode).toBe("desktop");
    });

    it("TABLET_MIN_WIDTH 경계값에서 올바르게 동작한다", () => {
      // 정확히 TABLET_MIN_WIDTH
      mockWindowWidth(LAYOUT_CONSTANTS.TABLET_MIN_WIDTH);
      const { result } = renderHook(() => useAuctionHistoryLayout());

      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(result.current.layoutMode).toBe("tablet");
    });

    it("TABLET_MIN_WIDTH - 1에서 mobile 모드가 된다", () => {
      mockWindowWidth(LAYOUT_CONSTANTS.TABLET_MIN_WIDTH - 1);
      const { result } = renderHook(() => useAuctionHistoryLayout());

      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(result.current.layoutMode).toBe("mobile");
    });
  });

  describe("windowWidth 반환", () => {
    it("현재 화면 너비를 반환한다", () => {
      mockWindowWidth(1400);
      const { result } = renderHook(() => useAuctionHistoryLayout());

      act(() => {
        jest.advanceTimersByTime(150);
      });

      expect(result.current.windowWidth).toBe(1400);
    });
  });

  describe("레이아웃 상수", () => {
    it("올바른 브레이크포인트 값을 가진다", () => {
      // DESKTOP_MIN_WIDTH는 간격 6px 기준으로 계산됨 (896 + 224 + 256 + 12 + 32 = 1420px, 안전마진 포함 1452px)
      expect(LAYOUT_CONSTANTS.DESKTOP_MIN_WIDTH).toBe(1452);
      expect(LAYOUT_CONSTANTS.TABLET_MIN_WIDTH).toBe(1240);
      expect(LAYOUT_CONSTANTS.TAILWIND_XL).toBe(1280);
      expect(LAYOUT_CONSTANTS.TAILWIND_2XL).toBe(1536);
    });

    it("컴포넌트 너비 상수가 올바르다", () => {
      expect(LAYOUT_CONSTANTS.MAIN_CONTENT_MAX_WIDTH).toBe(896); // max-w-4xl
      expect(LAYOUT_CONSTANTS.CATEGORY_WIDTH).toBe(224); // w-56
      expect(LAYOUT_CONSTANTS.FILTER_WIDTH_XL).toBe(240); // w-60
      expect(LAYOUT_CONSTANTS.FILTER_WIDTH_2XL).toBe(256); // w-64
    });

    it("데스크탑/태블릿 간격 상수가 올바르다", () => {
      // 데스크탑은 더 조밀한 간격 (6px), 태블릿은 기존 간격 유지 (24px)
      expect(LAYOUT_CONSTANTS.DESKTOP_GAP).toBe(6);
      expect(LAYOUT_CONSTANTS.TABLET_GAP).toBe(24);
    });

    it("사이드바 상단 위치 상수가 올바르다", () => {
      // 카테고리와 필터 컴포넌트가 동일한 top 값을 사용하도록 통일
      expect(LAYOUT_CONSTANTS.SIDEBAR_TOP).toBe(140); // top-[140px]
    });
  });
});
