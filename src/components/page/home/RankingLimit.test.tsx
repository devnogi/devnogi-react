import { render, screen } from "@testing-library/react";

import {
  useMonthLargestVolumeRanking,
  useTodayPopularRanking,
} from "@/hooks/useRankings";

import MonthLargestCard from "./MonthLargestCard";
import PopularRankingCard from "./PopularRankingCard";

jest.mock("@/hooks/useRankings", () => ({
  useTodayPopularRanking: jest.fn(),
  useMonthLargestVolumeRanking: jest.fn(),
}));

it("각 랭킹을 7건 요청하고 초과 응답도 7건까지만 보여준다", () => {
  const items = Array.from({ length: 9 }, (_, index) => ({
    rank: index + 1,
    itemName: `아이템 ${index + 1}`,
    itemDisplayName: `아이템 ${index + 1}`,
    itemTopCategory: "기타",
    itemSubCategory: "기타",
    totalQuantity: 100,
    totalVolume: 100,
    avgPrice: 100,
    auctionPricePerUnit: 100,
    itemCount: 1,
    totalPrice: 100,
    dateAuctionBuy: "2026-11-03T12:00:00Z",
  }));
  const state = { data: items, isLoading: false, error: null };
  jest
    .mocked(useTodayPopularRanking)
    .mockReturnValue(
      state as unknown as ReturnType<typeof useTodayPopularRanking>,
    );
  jest
    .mocked(useMonthLargestVolumeRanking)
    .mockReturnValue(
      state as unknown as ReturnType<typeof useMonthLargestVolumeRanking>,
    );
  render(
    <>
      <PopularRankingCard />
      <MonthLargestCard />
    </>,
  );
  expect(useTodayPopularRanking).toHaveBeenCalledWith(7);
  expect(useMonthLargestVolumeRanking).toHaveBeenCalledWith(7);
  expect(screen.getAllByText("아이템 7")).toHaveLength(2);
  expect(screen.queryByText("아이템 8")).not.toBeInTheDocument();
});
