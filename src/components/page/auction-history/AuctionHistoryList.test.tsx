import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AuctionHistoryItem } from "@/hooks/useAuctionHistory";

import AuctionHistoryList from "./AuctionHistoryList";

jest.mock("next/navigation", () => ({
  usePathname: () => "/auction-history",
  useSearchParams: () => new URLSearchParams("page=3&item_name=%EA%B2%80"),
}));

const item: AuctionHistoryItem = {
  itemName: "검 (붉은색)",
  itemDisplayName: "강한 검 (붉은색)",
  itemCount: 1,
  auctionPricePerUnit: 1000,
  dateAuctionBuy: "2026-11-05T10:00:00",
  auctionBuyId: "history-1",
  itemSubCategory: "검",
  itemTopCategory: "근거리 장비",
  itemOptions: [],
};

describe("AuctionHistoryList", () => {
  it("links mobile and desktop rows to detail while preserving the list URL", () => {
    render(<AuctionHistoryList items={[item]} previewEnabled={false} />);
    const links = screen.getAllByRole("link", { name: /검/ });
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute(
      "href",
      expect.stringContaining("/auction-history/history-1?return_to="),
    );
    const href = new URL(
      links[0].getAttribute("href") ?? "",
      "http://localhost",
    );
    expect(decodeURIComponent(href.searchParams.get("return_to") ?? "")).toBe(
      "/auction-history?page=3&item_name=검",
    );
    expect(screen.getByText("강한")).toBeInTheDocument();
    expect(screen.getByText("#붉은색")).toBeInTheDocument();
    fireEvent.mouseEnter(screen.getByText("강한 검 (붉은색)"));
    expect(screen.queryByText("가격 : 1,000 Gold")).not.toBeInTheDocument();
  });

  it("opens the desktop preview on item-name hover and row focus when enabled", async () => {
    render(<AuctionHistoryList items={[item]} previewEnabled />);
    const desktopName = screen.getByText("강한 검 (붉은색)");

    fireEvent.mouseEnter(desktopName);
    expect(await screen.findByText("가격 : 1,000 Gold")).toBeInTheDocument();

    fireEvent.mouseLeave(desktopName);
    await waitFor(() =>
      expect(screen.queryByText("가격 : 1,000 Gold")).not.toBeInTheDocument(),
    );
    const desktopLink = screen.getAllByRole("link", { name: /검/ })[1];
    fireEvent.focus(desktopLink);
    expect(await screen.findByText("가격 : 1,000 Gold")).toBeInTheDocument();
  });
});
