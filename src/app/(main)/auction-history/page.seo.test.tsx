import { render, screen } from "@testing-library/react";
import React from "react";

import AuctionHistoryPage from "./page";

jest.mock(
  "@/components/page/auction-common/AuctionMarketSummary",
  () =>
    function AuctionMarketSummary() {
      return <p>시세 요약</p>;
    },
);

jest.mock("./AuctionHistoryClient", () => {
  return function AuctionHistoryClient({
    header,
  }: {
    header: React.ReactNode;
  }) {
    return <div data-testid="auction-history-client">{header}</div>;
  };
});

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

describe("AuctionHistoryPage SEO landing content", () => {
  it("keeps a concise heading and crawlable SEO content in closed disclosures", () => {
    const { container } = render(<AuctionHistoryPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "마비노기 경매장 거래내역·시세",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/NEXON Open API를 기반/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "경매장 실시간 정보 보기",
        hidden: true,
      }),
    ).toHaveAttribute("href", "/auction-realtime");
    expect(
      screen.getByRole("link", { name: "근거리 장비", hidden: true }),
    ).toHaveAttribute("href", expect.stringContaining("top_category="));
    expect(
      container.querySelector('script[type="application/ld+json"]'),
    ).toHaveTextContent("마비노기 경매장 거래내역·아이템 시세 검색");
    expect(
      screen.getByText("데이터 안내").closest("details"),
    ).not.toHaveAttribute("open");
    expect(
      screen.getByText("자주 찾는 카테고리").closest("details"),
    ).not.toHaveAttribute("open");
    expect(screen.getByRole("link", { name: "현재 매물" })).toHaveAttribute(
      "href",
      "/auction-realtime",
    );
  });
});
