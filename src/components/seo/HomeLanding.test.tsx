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

describe("HomeLanding", () => {
  it("Hero 뒤에 홈 콘텐츠를 표시하고 본문 검색을 중복 표시하지 않는다", () => {
    render(<HomeLanding />);
    const hero = screen.getByRole("region", { name: "메인 광고" });
    const content = screen.getByRole("region", { name: "홈 콘텐츠" });
    const cards = screen.getByTestId("ranking-cards");
    expect(content).toContainElement(cards);
    expect(screen.queryByRole("search")).not.toBeInTheDocument();
    expect(
      hero.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.queryByText("주요 기능 보기")).not.toBeInTheDocument();
    expect(screen.queryByText("데이터 안내")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "오늘 많이 거래된 아이템" }),
    ).not.toBeInTheDocument();
  });
});
