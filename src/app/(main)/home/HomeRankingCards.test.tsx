import { render, screen } from "@testing-library/react";

import HomeRankingCards from "./HomeRankingCards";

jest.mock("@/components/page/home", () => ({
  PopularRankingCard: () => <div>인기 랭킹</div>,
  HomePopularPosts: () => <div>인기 게시글</div>,
  MonthLargestCard: () => <div>월간 랭킹</div>,
  HornBugleCard: () => <div>뿔피리</div>,
}));

it("네 카드를 순서대로 한 번씩 표시한다", () => {
  const { container } = render(<HomeRankingCards />);
  expect(
    screen
      .getAllByText(/^(인기 랭킹|뿔피리|월간 랭킹|인기 게시글)$/)
      .map((card) => card.textContent),
  ).toEqual(["인기 랭킹", "뿔피리", "월간 랭킹", "인기 게시글"]);
  expect(screen.queryByText("거래량 랭킹")).not.toBeInTheDocument();
  expect(container.querySelector(".items-stretch")).toBeInTheDocument();
});
