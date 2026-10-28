import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";

import type { AuctionHistoryItem } from "@/hooks/useAuctionHistory";

import TradeLogPage from "./page";

const mockRouter = { replace: jest.fn() };
let mockUrlParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/auction-history",
  useSearchParams: () => mockUrlParams,
}));

jest.mock("@/hooks/useItemCategories", () => {
  const categories = [
    {
      id: "all",
      name: "전체",
      children: [{ id: "근거리 장비/검", name: "검" }],
    },
  ];
  return { useItemCategories: () => ({ data: categories, isLoading: false }) };
});

jest.mock("@/hooks/useAuctionHistoryLayout", () => ({
  useAuctionHistoryLayout: () => ({
    layoutMode: "desktop",
    showCategorySidebar: true,
    showFilterSidebar: true,
    showMobileFilter: false,
  }),
}));

jest.mock("@/components/commons/Category", () => {
  return function MockCategory({
    onSelect,
  }: {
    onSelect: (id: string) => void;
  }) {
    return (
      <button onClick={() => onSelect("근거리 장비/검")}>
        Change Category
      </button>
    );
  };
});

jest.mock("@/components/page/auction-history/SearchFilterCard", () => {
  return function MockFilter({
    onFilterApply,
  }: {
    onFilterApply: (filters: {
      priceSearchRequest: { priceFrom: number };
    }) => void;
  }) {
    return (
      <button
        onClick={() =>
          onFilterApply({ priceSearchRequest: { priceFrom: 100 } })
        }
      >
        Apply Price
      </button>
    );
  };
});

jest.mock("@/components/page/auction-history/AuctionHistoryList", () => {
  return function MockList({
    items,
    isLoading,
  }: {
    items: AuctionHistoryItem[];
    isLoading: boolean;
  }) {
    return (
      <ul data-testid="trade-log-list" aria-busy={isLoading}>
        {items.map((item) => (
          <li key={item.auctionBuyId} data-testid="log-item">
            {item.itemName}
          </li>
        ))}
      </ul>
    );
  };
});

function response(names: string[]) {
  return Response.json({
    success: true,
    data: {
      items: names.map(
        (name, index): AuctionHistoryItem => ({
          itemName: name,
          itemDisplayName: name,
          itemCount: 1,
          auctionPricePerUnit: 100,
          dateAuctionBuy: "2026-10-01T12:00:00",
          auctionBuyId: String(index),
          itemSubCategory: "검",
          itemTopCategory: "근거리 장비",
          itemOptions: [],
        }),
      ),
      meta: {
        currentPage: 1,
        pageSize: 20,
        totalPages: 1,
        totalElements: names.length,
        isFirst: true,
        isLast: true,
      },
    },
  });
}

let fetchSpy: jest.SpyInstance;
let queryClient: QueryClient;

function renderPage() {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TradeLogPage />
    </QueryClientProvider>,
  );
}

function lastQuery() {
  const request = fetchSpy.mock.calls.at(-1)?.[0];
  expect(typeof request).toBe("string");
  const url = new URL(request as string, "http://localhost");
  expect(url.pathname).toBe("/api/auction-history/search");
  return url.searchParams;
}

describe("TradeLogPage", () => {
  beforeEach(() => {
    localStorage.clear();
    mockUrlParams = new URLSearchParams();
    mockRouter.replace.mockClear();
    fetchSpy = jest.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    cleanup();
    queryClient?.clear();
    fetchSpy.mockRestore();
  });

  it("마운트 시 현재 API 기본 파라미터를 보내고 거래 목록을 렌더링한다", async () => {
    fetchSpy.mockResolvedValue(response(["log1", "log2"]));
    renderPage();
    await waitFor(() =>
      expect(screen.getAllByTestId("log-item")).toHaveLength(2),
    );
    expect(screen.getByText("log1")).toBeInTheDocument();
    expect(screen.getByText("log2")).toBeInTheDocument();
    const params = lastQuery();
    expect(params.get("page")).toBe("1");
    expect(params.get("size")).toBe("20");
    expect(params.get("sortBy")).toBe("dateAuctionBuy");
    expect(params.get("direction")).toBe("desc");
    expect(params.get("isExactItemName")).toBe("true");
    expect(params.get("dateAuctionBuyRequest.dateAuctionBuyFrom")).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
    expect(params.has("itemTopCategory")).toBe(false);
  });

  it("카테고리와 가격 조건 변경 시 API를 다시 호출하고 목록을 갱신한다", async () => {
    fetchSpy
      .mockResolvedValueOnce(response(["log1"]))
      .mockResolvedValueOnce(response(["catChanged"]))
      .mockResolvedValueOnce(response(["priceChanged"]));
    renderPage();
    await screen.findByText("log1");
    fireEvent.click(screen.getByRole("button", { name: "Change Category" }));
    await screen.findByText("catChanged");
    expect(lastQuery().get("itemTopCategory")).toBe("근거리 장비");
    expect(lastQuery().get("itemSubCategory")).toBe("검");
    expect(lastQuery().get("page")).toBe("1");
    fireEvent.click(screen.getByRole("button", { name: "Apply Price" }));
    await screen.findByText("priceChanged");
    expect(lastQuery().get("priceSearchRequest.priceFrom")).toBe("100");
    expect(lastQuery().get("itemSubCategory")).toBe("검");
    expect(screen.queryByText("catChanged")).not.toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it("URL의 아이템 이름 조건을 현재 검색 API에 전달한다", async () => {
    mockUrlParams = new URLSearchParams({ itemName: "검" });
    fetchSpy.mockImplementation(() => Promise.resolve(response(["검"])));
    renderPage();
    await waitFor(() => expect(lastQuery().get("itemName")).toBe("검"));
    await waitFor(() =>
      expect(screen.getByTestId("log-item")).toHaveTextContent("검"),
    );
  });

  it("API 오류가 나면 로딩을 마치고 빈 목록을 렌더링한다", async () => {
    fetchSpy.mockRejectedValue(new Error("API Error"));
    renderPage();
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByTestId("trade-log-list")).toHaveAttribute(
        "aria-busy",
        "false",
      ),
    );
    expect(screen.queryAllByTestId("log-item")).toHaveLength(0);
  });
});
