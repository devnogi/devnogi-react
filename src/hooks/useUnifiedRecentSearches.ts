"use client";

import { useCallback, useEffect, useState } from "react";

import { UnifiedSearchItem } from "@/types/unified-search";

const UNIFIED_RECENT_SEARCHES_KEY = "unified_search_recent_v2";
const LEGACY_RECENT_SEARCHES_KEY = "auction_recent_searches";
const MAX_RECENT_SEARCHES = 10;

function isUnifiedSearchItem(value: unknown): value is UnifiedSearchItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<UnifiedSearchItem>;
  return (
    (item.type === "ITEM" || item.type === "MENU" || item.type === "USER") &&
    typeof item.label === "string" &&
    item.label.trim().length > 0 &&
    typeof item.targetKey === "string" &&
    item.targetKey.trim().length > 0
  );
}

function parseLegacyItem(value: unknown): UnifiedSearchItem | null {
  if (typeof value === "string" && value.trim()) {
    return { type: "ITEM", label: value, targetKey: value };
  }
  if (!value || typeof value !== "object") return null;
  const legacy = value as { itemName?: unknown };
  if (typeof legacy.itemName !== "string" || !legacy.itemName.trim()) {
    return null;
  }
  return {
    type: "ITEM",
    label: legacy.itemName,
    targetKey: legacy.itemName,
  };
}

function parseStoredArray(
  stored: string | null,
  parser: (value: unknown) => UnifiedSearchItem | null,
): UnifiedSearchItem[] {
  if (!stored) return [];
  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(parser)
      .filter((item): item is UnifiedSearchItem => item !== null)
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

function readStorage(key: string): {
  succeeded: boolean;
  value: string | null;
} {
  try {
    return { succeeded: true, value: localStorage.getItem(key) };
  } catch {
    return { succeeded: false, value: null };
  }
}

function storeSearches(searches: UnifiedSearchItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(UNIFIED_RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch {
    // Storage may be blocked or full. In-memory state still remains usable.
  }
}

function clearStoredSearches() {
  if (typeof window === "undefined") return;
  storeSearches([]);
  try {
    localStorage.removeItem(LEGACY_RECENT_SEARCHES_KEY);
  } catch {
    // Storage may be blocked. The v2 empty value prevents legacy resurrection.
  }
}

function getStoredSearches(): UnifiedSearchItem[] {
  if (typeof window === "undefined") return [];
  const current = readStorage(UNIFIED_RECENT_SEARCHES_KEY);
  if (current.succeeded && current.value !== null) {
    return parseStoredArray(current.value, (value) =>
      isUnifiedSearchItem(value) ? value : null,
    );
  }

  const legacy = readStorage(LEGACY_RECENT_SEARCHES_KEY);
  if (!legacy.succeeded) return [];
  const migrated = parseStoredArray(legacy.value, parseLegacyItem);
  if (migrated.length > 0) storeSearches(migrated);
  return migrated;
}

function searchIdentity(item: UnifiedSearchItem): string {
  return `${item.type}:${item.targetKey}`;
}

export function useUnifiedRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<UnifiedSearchItem[]>([]);

  useEffect(() => {
    setRecentSearches(getStoredSearches());
  }, []);

  const addRecentSearch = useCallback((search: UnifiedSearchItem) => {
    setRecentSearches((previous) => {
      const identity = searchIdentity(search);
      const updated = [
        search,
        ...previous.filter((item) => searchIdentity(item) !== identity),
      ].slice(0, MAX_RECENT_SEARCHES);
      storeSearches(updated);
      return updated;
    });
  }, []);

  const clearAllRecentSearches = useCallback(() => {
    setRecentSearches([]);
    clearStoredSearches();
  }, []);

  const refreshRecentSearches = useCallback(() => {
    setRecentSearches(getStoredSearches());
  }, []);

  return {
    recentSearches,
    addRecentSearch,
    clearAllRecentSearches,
    refreshRecentSearches,
  };
}
