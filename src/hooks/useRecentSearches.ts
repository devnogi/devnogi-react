"use client";

import { useState, useEffect, useCallback } from "react";

const RECENT_SEARCHES_KEY = "auction_recent_searches";
const MAX_RECENT_SEARCHES = 10;

export interface RecentSearch {
  itemName: string;
  topCategory?: string;
  subCategory?: string;
}

// localStorage에서 최근 검색어 가져오기
const getStoredSearches = (): RecentSearch[] => {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // 기존 string[] 형식 데이터 마이그레이션
      if (typeof parsed[0] === "string") {
        return parsed.map((s: string) => ({ itemName: s }));
      }
      return parsed as RecentSearch[];
    }
    return [];
  } catch {
    return [];
  }
};

// localStorage에 최근 검색어 저장
const storeSearches = (searches: RecentSearch[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
};

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // 초기 로드
  useEffect(() => {
    setRecentSearches(getStoredSearches());
  }, []);

  // 최근 검색어 추가
  const addRecentSearch = useCallback((search: RecentSearch) => {
    if (!search.itemName.trim()) return;

    setRecentSearches((prev) => {
      // 동일한 아이템명 제거 (중복 방지)
      const filtered = prev.filter((s) => s.itemName !== search.itemName);
      // 새 검색어를 맨 앞에 추가, 최대 개수 제한
      const updated = [search, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      storeSearches(updated);
      return updated;
    });
  }, []);

  // 특정 검색어 삭제
  const removeRecentSearch = useCallback((itemName: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s.itemName !== itemName);
      storeSearches(updated);
      return updated;
    });
  }, []);

  // 전체 삭제
  const clearAllRecentSearches = useCallback(() => {
    setRecentSearches([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    }
  }, []);

  // 외부에서 최신 데이터 다시 로드 (다른 컴포넌트에서 변경한 경우)
  const refreshRecentSearches = useCallback(() => {
    setRecentSearches(getStoredSearches());
  }, []);

  return {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearAllRecentSearches,
    refreshRecentSearches,
  };
}

// 카테고리 ID 생성 유틸 함수
export function getCategoryId(
  topCategory?: string,
  subCategory?: string
): string | undefined {
  if (topCategory && subCategory) {
    return `${topCategory}/${subCategory}`;
  }
  return undefined;
}
