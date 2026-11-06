import { fireEvent, render, screen, within } from "@testing-library/react";

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

jest.mock("@/hooks/useRankings", () => ({
  useTodayPopularRanking: () => ({
    data: ["향기로운 꿀 우유", "낙지", "물의 결정", "네 번째"].map(
      (itemName, index) => ({
        rank: index + 1,
        itemName,
        itemTopCategory: "기타",
        itemSubCategory: "재료",
      }),
    ),
  }),
}));

describe("HomeLanding", () => {
  it("상위 세 아이템을 해당 거래내역에 연결한다", () => {
    render(<HomeLanding />);
    const links = within(
      screen.getByRole("navigation", { name: "오늘 많이 거래된 아이템" }),
    ).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "향기로운 꿀 우유",
      "낙지",
      "물의 결정",
    ]);
    const url = new URL(links[0].getAttribute("href")!, "http://localhost");
    expect(url.pathname).toBe("/auction-history");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      item_name: "향기로운 꿀 우유",
      top_category: "기타",
      sub_category: "재료",
    });
  });
  it("홈 검색과 기존 주요 기능을 제공한다", () => {
    render(<HomeLanding />);

    expect(
      screen.queryByText("마비노기 경매장·시세·아이템 정보"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/한곳에서 확인하세요/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("search", { name: "메인 아이템 검색" }),
    ).toBeInTheDocument();
    const toggle = screen.getByText("주요 기능 보기");
    const description = screen.getByText(
      "아이템명과 조건으로 최근 거래내역을 찾아보세요.",
    );
    expect(description).not.toBeVisible();
    fireEvent.click(toggle);
    expect(description).toBeVisible();
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

  it("검색은 히어로에 두고 본문과 기존 기능 링크를 유지한다", () => {
    render(<HomeLanding />);

    const hero = screen.getByRole("region", { name: "아이템 검색" });
    const card = screen.getByRole("region", { name: "홈 콘텐츠" });
    expect(hero.querySelectorAll("img")).toHaveLength(2);
    expect(hero.querySelector("img")).toHaveAttribute(
      "src",
      expect.stringContaining("home-hero-library-v2.png"),
    );
    expect(
      card.className
        .split(/\s+/)
        .some((token) => /(^|:)shadow(?:-|$)/.test(token)),
    ).toBe(false);
    expect(
      within(hero).getByRole("search", { name: "메인 아이템 검색" }),
    ).toBeInTheDocument();

    expect(
      within(card).getByRole("heading", { name: "데이터 안내" }),
    ).toBeInTheDocument();
    expect(within(card).getByTestId("ranking-cards")).toBeInTheDocument();
    expect(
      within(card).queryByText("메모노기에서 보는 마비노기 경매장 시세"),
    ).not.toBeInTheDocument();
    expect(
      within(card)
        .getByTestId("ranking-cards")
        .compareDocumentPosition(within(card).getByText("주요 기능 보기")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
