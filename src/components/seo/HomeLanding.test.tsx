import { render, screen } from "@testing-library/react";

import HomeLanding from "./HomeLanding";

jest.mock("@/app/(main)/home/HomeRankingCards", () => {
  function HomeRankingCardsMock() {
    return <div data-testid="ranking-cards" />;
  }

  return HomeRankingCardsMock;
});

describe("HomeLanding", () => {
  it("서버 렌더링 가능한 홈 제목과 주요 기능 링크를 제공한다", () => {
    render(<HomeLanding />);

    expect(
      screen.getByRole("heading", {
        name: "마비노기 경매장·시세·아이템 정보",
        level: 1,
      }),
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
  });
});
