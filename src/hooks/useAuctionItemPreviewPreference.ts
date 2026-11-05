"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "auction-item-preview:v1";

export function useAuctionItemPreviewPreference() {
  const [isPreviewEnabled, setIsPreviewEnabledState] = useState(true);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setIsPreviewEnabledState(stored === "true");
      }
    } catch {
      // Storage can be unavailable in private browsing. Keep the ON default.
    }
  }, []);

  const setIsPreviewEnabled = useCallback((enabled: boolean) => {
    setIsPreviewEnabledState(enabled);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {
      // The in-memory preference still applies for the current page.
    }
  }, []);

  return { isPreviewEnabled, setIsPreviewEnabled };
}
