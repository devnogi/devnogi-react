import { render, screen } from "@testing-library/react";

import HomeLanding from "./HomeLanding";

jest.mock("@/hooks/useHero", () => ({
  useHero: () =>
    ["/home-hero-library-v2.png", "/home-hero-winter.png"].map(
      (imageUrl, index) => ({
        id: index + 1,
        imageUrl,
        altText: "메인 이미지",
        linkUrl: null,
        position: index + 1,
        advertisement: false,
        startsAt: null,
        endsAt: null,
      }),
    ),
}));

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
  it("Hero와 카드 사이에 검색을 두고 부가 안내를 제거한다", () => {
    render(<HomeLanding />);
    const hero = screen.getByRole("region", { name: "메인 광고" });
    const search = screen.getByRole("search", { name: "메인 아이템 검색" });
    const cards = screen.getByTestId("ranking-cards");
    expect(hero).not.toContainElement(search);
    expect(
      hero.compareDocumentPosition(search) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      search.compareDocumentPosition(cards) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.queryByText("주요 기능 보기")).not.toBeInTheDocument();
    expect(screen.queryByText("데이터 안내")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "오늘 많이 거래된 아이템" }),
    ).not.toBeInTheDocument();
  });
});
