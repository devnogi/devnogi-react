import { render, screen } from "@testing-library/react";

import HomeRankingCards from "./HomeRankingCards";

jest.mock("@/components/page/home", () => ({
  PopularRankingCard: () => <div>인기 랭킹</div>,
  AllTimeHighlightCard: () => <div>역대 랭킹</div>,
  MonthLargestCard: () => <div>월간 랭킹</div>,
  HornBugleCard: () => <div>뿔피리</div>,
}));

it("네 카드를 순서대로 한 번씩 표시한다", () => {
  render(<HomeRankingCards />);
  const popular = screen.getAllByText("인기 랭킹");
  expect(popular).toHaveLength(1);
  for (const label of ["역대 랭킹", "월간 랭킹", "뿔피리"]) {
    const element = screen.getByText(label);
    expect(
      popular[0].compareDocumentPosition(element) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  }
  expect(screen.queryByText("거래량 랭킹")).not.toBeInTheDocument();
});
