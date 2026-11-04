import { act, renderHook, waitFor } from "@testing-library/react";

import { useUnifiedRecentSearches } from "./useUnifiedRecentSearches";

const item = {
  type: "ITEM" as const,
  label: "빛나는 검",
  targetKey: "빛나는 검",
};

beforeEach(() => {
  jest.restoreAllMocks();
  localStorage.clear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

it("v2 빈 배열이 있으면 legacy 검색을 다시 불러오지 않는다", async () => {
  localStorage.setItem("unified_search_recent_v2", "[]");
  localStorage.setItem(
    "auction_recent_searches",
    JSON.stringify([{ itemName: "과거 아이템" }]),
  );

  const { result } = renderHook(() => useUnifiedRecentSearches());
  await waitFor(() => expect(result.current.recentSearches).toEqual([]));
});

it("legacy 아이템 기록을 v2 형식으로 마이그레이션해 저장한다", async () => {
  localStorage.setItem(
    "auction_recent_searches",
    JSON.stringify([{ itemName: "과거 아이템" }]),
  );

  const { result } = renderHook(() => useUnifiedRecentSearches());
  await waitFor(() =>
    expect(result.current.recentSearches[0]).toEqual({
      type: "ITEM",
      label: "과거 아이템",
      targetKey: "과거 아이템",
    }),
  );
  expect(JSON.parse(localStorage.getItem("unified_search_recent_v2")!)).toEqual(
    result.current.recentSearches,
  );
});

it("저장소 읽기가 차단돼도 빈 메모리 상태로 동작한다", async () => {
  jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new DOMException("blocked", "SecurityError");
  });

  const { result } = renderHook(() => useUnifiedRecentSearches());
  await waitFor(() => expect(result.current.recentSearches).toEqual([]));
});

it("저장소 쓰기가 실패해도 새 검색을 메모리에 유지한다", async () => {
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("full", "QuotaExceededError");
  });

  const { result } = renderHook(() => useUnifiedRecentSearches());
  act(() => result.current.addRecentSearch(item));
  await waitFor(() => expect(result.current.recentSearches).toEqual([item]));
});

it("저장소 삭제가 차단돼도 메모리 검색을 비운다", async () => {
  localStorage.setItem("unified_search_recent_v2", JSON.stringify([item]));
  const { result } = renderHook(() => useUnifiedRecentSearches());
  await waitFor(() => expect(result.current.recentSearches).toEqual([item]));
  jest.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
    throw new DOMException("blocked", "SecurityError");
  });

  act(() => result.current.clearAllRecentSearches());
  expect(result.current.recentSearches).toEqual([]);
});

it("전체삭제를 v2 빈 배열로 남겨 legacy 재등장을 막는다", async () => {
  localStorage.setItem("unified_search_recent_v2", JSON.stringify([item]));
  localStorage.setItem(
    "auction_recent_searches",
    JSON.stringify([{ itemName: "과거 아이템" }]),
  );
  const { result } = renderHook(() => useUnifiedRecentSearches());
  await waitFor(() => expect(result.current.recentSearches).toEqual([item]));

  act(() => result.current.clearAllRecentSearches());
  expect(localStorage.getItem("unified_search_recent_v2")).toBe("[]");
  expect(localStorage.getItem("auction_recent_searches")).toBeNull();
  act(() => result.current.refreshRecentSearches());
  expect(result.current.recentSearches).toEqual([]);
});
