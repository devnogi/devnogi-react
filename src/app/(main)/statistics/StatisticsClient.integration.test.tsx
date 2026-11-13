import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

import type { StatisticsBase } from "@/types/statistics";

import StatisticsPage from "./StatisticsClient";

const mockSearchParams = new URLSearchParams(
  "tab=item&period=daily&item_name=나무장작&top_category=기타&sub_category=기타",
);
const mockRouter = { replace: jest.fn() };

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/statistics",
  useSearchParams: () => mockSearchParams,
}));
jest.mock("@/hooks/useItemCategories", () => ({
  useItemCategories: () => ({ data: [] }),
}));
jest.mock("@/hooks/useItemInfos", () => ({
  useItemInfos: () => ({ data: [] }),
}));
jest.mock("@/components/page/statistics/StatisticsExamples", () => () => null);
jest.mock("@/components/page/statistics/PriceChart", () => () => null);
jest.mock("@/components/page/statistics/VolumeChart", () => () => null);
jest.mock("@/components/page/statistics/StatisticsTable", () => () => null);
jest.mock(
  "@/components/page/statistics/StatisticsSummaryCards",
  () =>
    function MockStatisticsSummary({ data }: { data: StatisticsBase[] }) {
      return <div>평균 가격 {data[0]?.avgPrice}</div>;
    },
);

const row = {
  itemName: "나무장작",
  date: "2026-11-14",
  minPrice: 50,
  maxPrice: 150,
  avgPrice: 100,
  totalQuantity: 3,
  totalVolume: 300,
};
let client: QueryClient;
let fetchSpy: jest.SpyInstance;

function renderPage() {
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={client}>
      <StatisticsPage />
    </QueryClientProvider>,
  );
}
const success = (rows: (typeof row)[]) =>
  Response.json({ success: true, data: rows });

beforeEach(() => {
  localStorage.clear();
  fetchSpy = jest.spyOn(globalThis, "fetch");
});
afterEach(() => {
  cleanup();
  client.clear();
  fetchSpy.mockRestore();
});

it("최초 실패는 빈 통계로 보이지 않고 활성 기간만 재시도한다", async () => {
  let dailyFails = true;
  fetchSpy.mockImplementation(async (input: string) =>
    input.includes("/daily/")
      ? dailyFails
        ? Response.json({}, { status: 500 })
        : success([row])
      : success([]),
  );
  renderPage();
  await screen.findByText("통계를 불러오지 못했습니다.");
  expect(screen.queryByText("조회 결과가 없습니다")).not.toBeInTheDocument();
  const weeklyCalls = fetchSpy.mock.calls.filter(([url]) =>
    String(url).includes("/weekly/"),
  ).length;
  dailyFails = false;
  fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
  expect(await screen.findByText("평균 가격 100")).toBeInTheDocument();
  expect(
    fetchSpy.mock.calls.filter(([url]) => String(url).includes("/weekly/")),
  ).toHaveLength(weeklyCalls);
});

it("비활성 기간 실패를 숨기고 갱신 실패 시 기존 통계를 유지한다", async () => {
  let dailyFails = false;
  let weeklyFails = true;
  fetchSpy.mockImplementation(async (input: string) => {
    const fails = input.includes("/daily/") ? dailyFails : weeklyFails;
    return fails
      ? Response.json({ success: false, data: null }, { status: 500 })
      : success(input.includes("/daily/") ? [row] : []);
  });
  renderPage();
  await screen.findByText("평균 가격 100");
  expect(
    screen.queryByText("통계를 불러오지 못했습니다."),
  ).not.toBeInTheDocument();
  dailyFails = true;
  await act(async () => {
    await client.invalidateQueries({
      queryKey: ["statistics", "daily", "items"],
    });
  });
  await screen.findByText(
    "통계를 갱신하지 못했습니다. 이전 결과를 표시합니다.",
  );
  expect(screen.getByText("평균 가격 100")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "주간" }));
  await screen.findByText("통계를 불러오지 못했습니다.");
  expect(screen.queryByText("평균 가격 100")).not.toBeInTheDocument();
  weeklyFails = false;
  fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
  expect(await screen.findByText("조회 결과가 없습니다")).toBeInTheDocument();
  expect(
    screen.queryByText("통계를 불러오지 못했습니다."),
  ).not.toBeInTheDocument();
});
