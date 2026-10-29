import { render, screen } from "@testing-library/react";
import React from "react";

import AuctionHistoryPage from "./page";

jest.mock("./AuctionHistoryClient", () => {
  return function AuctionHistoryClient() {
    return <div data-testid="auction-history-client" />;
  };
});

describe("AuctionHistoryPage SEO landing content", () => {
  it("renders the public heading, guidance, and crawlable feature links before the client UI", () => {
    const { container } = render(<AuctionHistoryPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "마비노기 경매장 거래내역·아이템 시세 검색",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/NEXON Open API를 기반/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "경매장 실시간 정보 보기" }),
    ).toHaveAttribute("href", "/auction-realtime");
    expect(screen.getByRole("link", { name: "근거리 장비" })).toHaveAttribute(
      "href",
      expect.stringContaining("top_category="),
    );
    expect(
      container.querySelector('script[type="application/ld+json"]'),
    ).toHaveTextContent("마비노기 경매장 거래내역·아이템 시세 검색");
  });
});
