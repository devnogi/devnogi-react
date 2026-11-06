import { render, screen } from "@testing-library/react";

import AuctionViewTabs from "./AuctionViewTabs";

let mockParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useSearchParams: () => mockParams,
}));

describe("AuctionViewTabs", () => {
  it("keeps only item identity when moving between auction views", () => {
    mockParams = new URLSearchParams({
      item_name: "나무장작",
      top_category: "기타",
      sub_category: "기타",
      page: "9",
      "priceSearchRequest.priceFrom": "100",
      "dateAuctionBuyRequest.dateAuctionBuyFrom": "2026-11-01",
    });
    render(<AuctionViewTabs currentView="history" />);
    const target = new URL(
      screen.getByRole("link", { name: "현재 매물" }).getAttribute("href")!,
      "https://example.com",
    );
    expect(target.pathname).toBe("/auction-realtime");
    expect(Object.fromEntries(target.searchParams)).toEqual({
      item_name: "나무장작",
      top_category: "기타",
      sub_category: "기타",
    });
    expect(screen.getByRole("link", { name: "거래내역" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("supports existing camel-case search links and marks the realtime view", () => {
    mockParams = new URLSearchParams({
      itemName: "검",
      itemTopCategory: "근거리 장비",
      itemSubCategory: "검",
      direction: "desc",
    });
    render(<AuctionViewTabs currentView="realtime" />);
    const target = new URL(
      screen.getByRole("link", { name: "거래내역" }).getAttribute("href")!,
      "https://example.com",
    );
    expect(Object.fromEntries(target.searchParams)).toEqual({
      item_name: "검",
      top_category: "근거리 장비",
      sub_category: "검",
    });
    expect(screen.getByRole("link", { name: "현재 매물" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
