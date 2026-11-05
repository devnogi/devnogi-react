import { act, renderHook, waitFor } from "@testing-library/react";

import { useAuctionItemPreviewPreference } from "./useAuctionItemPreviewPreference";

describe("useAuctionItemPreviewPreference", () => {
  beforeEach(() => localStorage.clear());

  it("defaults to ON and persists the shared preference", async () => {
    const { result, unmount } = renderHook(() =>
      useAuctionItemPreviewPreference(),
    );
    expect(result.current.isPreviewEnabled).toBe(true);
    act(() => result.current.setIsPreviewEnabled(false));
    expect(localStorage.getItem("auction-item-preview:v1")).toBe("false");
    unmount();
    const restored = renderHook(() => useAuctionItemPreviewPreference());
    await waitFor(() =>
      expect(restored.result.current.isPreviewEnabled).toBe(false),
    );
  });
});
