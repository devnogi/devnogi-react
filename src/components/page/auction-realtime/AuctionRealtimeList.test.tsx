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
  dateRegister: "2026-11-05T09:00:00",
  dateAuctionExpire: "2026-11-05T12:00:00",
  id: 123,
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
      expect.stringContaining("/auction-realtime/123?return_to="),
    );
    expect(links[1]).toHaveAttribute("href", links[0].getAttribute("href"));
    expect(
      new URL(
        links[0].getAttribute("href")!,
        "https://example.test",
      ).searchParams.get("return_to"),
    ).toBe("/auction-realtime?page=2&itemName=%EA%B2%80");
    expect(screen.getByText("축복받은")).toBeInTheDocument();
    expect(screen.getByText("#붉은색")).toBeInTheDocument();
    fireEvent.click(links[0]);
    expect(screen.queryByText("가격 : 2,500 Gold")).not.toBeInTheDocument();
  });

  it("renders malformed expiry dates without crashing either layout", () => {
    render(
      <AuctionRealtimeList
        items={[{ ...item, dateAuctionExpire: "invalid" }]}
        previewEnabled={false}
      />,
    );
    expect(screen.getAllByText(/일시 정보 없음/)).toHaveLength(2);
  });
});
