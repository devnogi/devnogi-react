import { fireEvent, render, screen, within } from "@testing-library/react";

import type { VolumeRankingResponse } from "@/types/ranking";

import StatisticsPage from "./StatisticsClient";

const mockRouter = { replace: jest.fn() };
let mockSearchParams = new URLSearchParams();
const mockWeekly = jest.fn();
const mockDaily = jest.fn();
const mockRanking = jest.fn();
let mockRankingError: Error | null = null;
let mockRankings: VolumeRankingResponse[] = [];

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/statistics",
  useSearchParams: () => mockSearchParams,
}));

jest.mock("@/hooks/useStatistics", () => ({
  useItemDailyStatistics: (params: unknown) => {
    mockDaily(params);
    return { data: [], isLoading: false };
  },
  useItemWeeklyStatistics: (params: unknown) => {
    mockWeekly(params);
    return { data: [], isLoading: false };
  },
  useSubcategoryDailyStatistics: () => ({ data: [], isLoading: false }),
  useSubcategoryWeeklyStatistics: () => ({ data: [], isLoading: false }),
  useTopCategoryDailyStatistics: () => ({ data: [], isLoading: false }),
  useTopCategoryWeeklyStatistics: () => ({ data: [], isLoading: false }),
}));

jest.mock("@/hooks/useRankings", () => ({
  useTodayPopularRanking: (limit: number) => {
    mockRanking(limit);
    return { data: mockRankings, error: mockRankingError, isLoading: false };
  },
}));

jest.mock("@/hooks/useItemCategories", () => ({
  useItemCategories: () => ({
    data: [
      {
        id: "all",
        name: "전체",
        children: [
          {
            id: "기타",
            name: "기타",
            children: [{ id: "기타/기타", name: "기타" }],
          },
        ],
      },
    ],
  }),
}));

jest.mock("@/hooks/useItemInfos", () => ({
  useItemInfos: () => ({
    data: [{ name: "나무장작", topCategory: "기타", subCategory: "기타" }],
  }),
}));

function ranking(
  itemName: string,
  overrides: Partial<VolumeRankingResponse> = {},
) {
  return {
    rank: 1,
    itemName,
    itemTopCategory: "기타",
    itemSubCategory: "기타",
    totalQuantity: 100,
    totalVolume: 1000,
    avgPrice: 10,
    dateAuctionBuy: "2026-11-06",
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSearchParams = new URLSearchParams();
  mockRankingError = null;
  mockRankings = [ranking("나무장작")];
  localStorage.clear();
});

it("홈과 같은 랭킹을 재사용하고 유효한 분류의 조회 예시를 최대 3개 표시한다", () => {
  mockRankings = [
    ranking("빈 분류", { itemSubCategory: "" }),
    ranking("없는 분류", { itemTopCategory: "없음" }),
    ranking("없는 하위 분류", { itemSubCategory: "없음" }),
    ranking(" "),
    ranking("나무장작"),
    ranking("향기로운 꿀 우유"),
    ranking("빈 병"),
    ranking("네 번째"),
  ];
  render(<StatisticsPage />);
  const examples = screen.getByRole("region", {
    name: "인기 아이템으로 시세 조회",
  });
  expect(within(examples).getAllByRole("button")).toHaveLength(3);
  expect(
    within(examples).getByRole("button", { name: "나무장작 시세 조회" }),
  ).toBeVisible();
  expect(within(examples).queryByText("없는 분류")).not.toBeInTheDocument();
  expect(within(examples).queryByText("네 번째")).not.toBeInTheDocument();
  expect(mockRanking).toHaveBeenCalledWith(7);
});

it("조회 예시 선택으로 이름과 분류를 채우고 주간 및 날짜 조건을 유지한다", () => {
  mockSearchParams = new URLSearchParams(
    "tab=item&period=weekly&date_from=2026-10-01&date_to=2026-11-01",
  );
  render(<StatisticsPage />);
  fireEvent.click(screen.getByRole("button", { name: "나무장작 시세 조회" }));
  expect(screen.getByLabelText("아이템명")).toHaveValue("나무장작");
  expect(screen.getByLabelText("상위 분류")).toHaveValue("기타");
  expect(screen.getByLabelText("하위 분류")).toHaveValue("기타");
  expect(mockWeekly).toHaveBeenLastCalledWith({
    itemName: "나무장작",
    topCategory: "기타",
    subCategory: "기타",
    dateFrom: "2026-10-01",
    dateTo: "2026-11-01",
  });
  const lastUrl = mockRouter.replace.mock.calls.at(-1)?.[0];
  expect(
    Object.fromEntries(new URL(lastUrl, "http://localhost").searchParams),
  ).toEqual({
    tab: "item",
    period: "weekly",
    date_from: "2026-10-01",
    date_to: "2026-11-01",
    item_name: "나무장작",
    top_category: "기타",
    sub_category: "기타",
  });
  expect(
    screen.queryByRole("region", { name: "인기 아이템으로 시세 조회" }),
  ).not.toBeInTheDocument();
});

it.each(["empty", "error"])(
  "랭킹 %s 상태에서도 수동 조회가 가능하다",
  (state) => {
    mockRankings = state === "empty" ? [] : [ranking("나무장작")];
    mockRankingError = state === "error" ? new Error("unavailable") : null;
    render(<StatisticsPage />);
    expect(
      screen.queryByRole("region", { name: "인기 아이템으로 시세 조회" }),
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("상위 분류"), {
      target: { value: "기타" },
    });
    fireEvent.change(screen.getByLabelText("하위 분류"), {
      target: { value: "기타" },
    });
    fireEvent.change(screen.getByLabelText("아이템명"), {
      target: { value: "나무장작" },
    });
    fireEvent.click(screen.getByRole("button", { name: "조회" }));
    expect(mockDaily).toHaveBeenLastCalledWith(
      expect.objectContaining({
        itemName: "나무장작",
        topCategory: "기타",
        subCategory: "기타",
      }),
    );
  },
);
