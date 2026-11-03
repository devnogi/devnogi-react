import { render, screen } from "@testing-library/react";

import HomeLanding from "./HomeLanding";

jest.mock("@/app/(main)/home/HomeRankingCards", () => {
  function HomeRankingCardsMock() {
    return <div data-testid="ranking-cards" />;
  }

  return HomeRankingCardsMock;
});

jest.mock("@/components/navigation/HomeSearch", () => ({
  HomeSearch: () => <div role="search" aria-label="메인 아이템 검색" />,
}));

describe("HomeLanding", () => {
  it("홈 검색과 기존 주요 기능을 제공한다", () => {
    render(<HomeLanding />);

    expect(
      screen.queryByText("마비노기 경매장·시세·아이템 정보"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/한곳에서 확인하세요/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("search", { name: "메인 아이템 검색" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /경매장 거래내역/ }),
    ).toHaveAttribute("href", "/auction-history");
    expect(
      screen.getByRole("link", { name: /경매장 실시간 정보/ }),
    ).toHaveAttribute("href", "/auction-realtime");
    expect(screen.getByRole("link", { name: /시세 정보/ })).toHaveAttribute(
      "href",
      "/statistics",
    );
    expect(screen.getByRole("link", { name: /아이템 정보/ })).toHaveAttribute(
      "href",
      "/item-info",
    );
    expect(
      screen.getByRole("heading", { name: "데이터 안내" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/NEXON Open API/)).toBeInTheDocument();
    expect(screen.getByTestId("ranking-cards")).toBeInTheDocument();
    expect(
      screen.queryByText(/게임 서버|어비스|소환의 결계/),
    ).not.toBeInTheDocument();
  });
});
