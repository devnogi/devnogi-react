import { fireEvent, render, screen } from "@testing-library/react";

import { AuctionRealtimeItem } from "@/hooks/useAuctionRealtime";

import AuctionRealtimeList from "./AuctionRealtimeList";

jest.mock("next/navigation", () => ({
  usePathname: () => "/auction-realtime",
  useSearchParams: () => new URLSearchParams("page=2&itemName=%EA%B2%80"),
}));

const item: AuctionRealtimeItem = {
  itemName: "검 (붉은색)",
  itemDisplayName: "축복받은 검 (붉은색)",
  itemCount: 2,
  auctionPricePerUnit: 2500,
  dateAuctionRegister: "2026-11-05T09:00:00",
  dateAuctionExpire: "2026-11-05T12:00:00",
  auctionId: "realtime-1",
  itemSubCategory: "검",
  itemTopCategory: "근거리 장비",
  itemOptions: [],
};

describe("AuctionRealtimeList", () => {
  it("keeps the mobile card details and links one tap to detail without a popup", () => {
    render(<AuctionRealtimeList items={[item]} previewEnabled={false} />);

    const links = screen.getAllByRole("link", { name: /검/ });
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute(
      "href",
      expect.stringContaining("/auction-realtime/realtime-1?return_to="),
    );
    expect(screen.getByText("축복받은")).toBeInTheDocument();
    expect(screen.getByText("#붉은색")).toBeInTheDocument();
    fireEvent.click(links[0]);
    expect(screen.queryByText("가격 : 2,500 Gold")).not.toBeInTheDocument();
  });
});
