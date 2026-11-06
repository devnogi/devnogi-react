import { render, screen } from "@testing-library/react";

import { useTodayPopularRanking } from "@/hooks/useRankings";

import PopularRankingCard from "./PopularRankingCard";

jest.mock("@/hooks/useRankings", () => ({ useTodayPopularRanking: jest.fn() }));
const ranking = jest.mocked(useTodayPopularRanking);

it("7개 랭킹 요청을 한 번 사용하고 실제 값을 표시한다", () => {
  ranking.mockReturnValue({
    data: [
      {
        rank: 1,
        itemName: "테스트 아이템",
        itemTopCategory: "무기",
        itemSubCategory: "검",
        totalQuantity: 42,
        avgPrice: 1200,
      },
    ],
    isLoading: false,
    error: null,
  } as unknown as ReturnType<typeof useTodayPopularRanking>);
  render(<PopularRankingCard />);
  expect(ranking).toHaveBeenCalledTimes(1);
  expect(ranking).toHaveBeenCalledWith(7);
  expect(screen.getByText("테스트 아이템")).toBeInTheDocument();
  expect(screen.getByText("42개")).toBeInTheDocument();
  expect(screen.getByText("평균 1,200")).toBeInTheDocument();
});

it.each([
  [{ data: [], isLoading: false, error: null }, "랭킹 데이터가 없습니다"],
  [
    { data: undefined, isLoading: false, error: new Error("failed") },
    "데이터를 불러올 수 없습니다",
  ],
])("빈 데이터와 오류 상태를 유지한다", (state, message) => {
  ranking.mockReturnValue(state as ReturnType<typeof useTodayPopularRanking>);
  render(<PopularRankingCard />);
  expect(screen.getByText(message)).toBeInTheDocument();
});

it("빈 랭킹에 전용 원형 이미지를 안내 문구 위에 표시한다", () => {
  ranking.mockReturnValue({
    data: [],
    isLoading: false,
    error: null,
  } as unknown as ReturnType<typeof useTodayPopularRanking>);
  render(<PopularRankingCard />);
  const image = screen.getByRole("img", { name: "비어 있는 랭킹 보드" });
  const emptyState = screen.getByText("랭킹 데이터가 없습니다").parentElement;
  expect(emptyState).toHaveClass("lg:min-h-[420px]");
  expect(emptyState).not.toHaveClass("min-h-[420px]");
  expect(image).toHaveClass("[clip-path:circle(43%_at_50%_50%)]");
  expect(image).toHaveAttribute(
    "src",
    expect.stringContaining("ranking-empty-medallion.png"),
  );
  expect(
    image.compareDocumentPosition(screen.getByText("랭킹 데이터가 없습니다")) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
});
