import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";

import type { AuctionHistoryItem } from "@/hooks/useAuctionHistory";

import TradeLogPage from "./AuctionHistoryClient";

const mockRouter = { replace: jest.fn() };
let mockUrlParams = new URLSearchParams();
let mockCategoriesLoading = false;
let mockMobile = false;

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
  return {
    useItemCategories: () => ({
      data: categories,
      isLoading: mockCategoriesLoading,
    }),
  };
});

jest.mock("@/hooks/useAuctionHistoryLayout", () => ({
  useAuctionHistoryLayout: () => ({
    layoutMode: "desktop",
    showCategorySidebar: true,
    showFilterSidebar: true,
    showMobileFilter: mockMobile,
  }),
}));

jest.mock(
  "@/components/page/auction-history/MobileFilterModal",
  () =>
    function MockModal({ onApply }: { onApply: (data: object) => void }) {
      return (
        <>
          <button onClick={() => onApply({ priceMin: "200", priceMax: "" })}>
            Mobile price
          </button>
          <button onClick={() => onApply({ activeFilters: [] })}>
            Clear options
          </button>
        </>
      );
    },
);

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

jest.mock("@/components/page/auction-common/AuctionItemSearch", () => {
  return function MockAuctionItemSearch({
    onSearch,
  }: {
    onSearch: (
      name: string,
      item?: { name: string; topCategory: string; subCategory: string },
    ) => void;
  }) {
    return (
      <div data-testid="auction-item-search">
        <button onClick={() => onSearch("직접 검색")}>Direct Search</button>
        <button
          onClick={() =>
            onSearch("롱소드", {
              name: "롱소드",
              topCategory: "근거리 장비",
              subCategory: "검",
            })
          }
        >
          Autocomplete Search
        </button>
        <button onClick={() => onSearch("")}>Clear Search</button>
      </div>
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

function renderPage(header?: React.ReactNode) {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TradeLogPage header={header} />
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
    mockCategoriesLoading = false;
    mockMobile = false;
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

  it("keeps server-rendered heading and guidance visible while categories load", () => {
    mockCategoriesLoading = true;
    fetchSpy.mockResolvedValue(response([]));
    renderPage(
      <header>
        <h1>경매장 거래내역</h1>
        <p>데이터 안내</p>
      </header>,
    );
    expect(
      screen.getByRole("heading", { name: "경매장 거래내역" }),
    ).toBeInTheDocument();
    expect(screen.getByText("데이터 안내")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("로딩 중...");
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

  it("아이템 직접 검색, 자동완성 선택, 초기화 시 페이지를 1로 되돌린다", async () => {
    mockUrlParams = new URLSearchParams({ page: "3", itemName: "이전 검색" });
    fetchSpy.mockImplementation(() => Promise.resolve(response(["result"])));
    renderPage();
    await waitFor(() => expect(lastQuery().get("page")).toBe("3"));

    fireEvent.click(screen.getByRole("button", { name: "Direct Search" }));
    await waitFor(() => {
      expect(lastQuery().get("page")).toBe("1");
      expect(lastQuery().get("itemName")).toBe("직접 검색");
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Autocomplete Search" }),
    );
    await waitFor(() => {
      expect(lastQuery().get("page")).toBe("1");
      expect(lastQuery().get("itemName")).toBe("롱소드");
      expect(lastQuery().get("itemTopCategory")).toBe("근거리 장비");
      expect(lastQuery().get("itemSubCategory")).toBe("검");
    });

    fireEvent.click(screen.getByRole("button", { name: "Clear Search" }));
    await waitFor(() => {
      expect(lastQuery().get("page")).toBe("1");
      expect(lastQuery().has("itemName")).toBe(false);
      expect(lastQuery().get("itemTopCategory")).toBe("근거리 장비");
    });
  });

  it("does not overwrite incoming direct or back-navigation filters with stale state", async () => {
    mockUrlParams = new URLSearchParams({
      "metalwareSearchRequests[0].metalware": "최대 대미지",
    });
    fetchSpy.mockResolvedValue(response(["result"]));
    const view = renderPage();
    await waitFor(() =>
      expect(lastQuery().get("metalwareSearchRequests[0].metalware")).toBe(
        "최대 대미지",
      ),
    );
    expect(mockRouter.replace).not.toHaveBeenCalled();
    mockUrlParams = new URLSearchParams({ item_name: "뒤로 이동" });
    view.rerender(
      <QueryClientProvider client={queryClient}>
        <TradeLogPage />
      </QueryClientProvider>,
    );
    await waitFor(() => expect(lastQuery().get("itemName")).toBe("뒤로 이동"));
    expect(lastQuery().has("metalwareSearchRequests[0].metalware")).toBe(false);
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("preserves incoming options on a price-only apply and clears them only on options apply", async () => {
    mockMobile = true;
    mockUrlParams = new URLSearchParams({
      "itemOptionSearchRequest.attackMaxSearch.attackMaxFrom": "10",
    });
    fetchSpy.mockResolvedValue(response(["result"]));
    renderPage();
    await waitFor(() =>
      expect(
        lastQuery().get(
          "itemOptionSearchRequest.attackMaxSearch.attackMaxFrom",
        ),
      ).toBe("10"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Mobile price" }));
    await waitFor(() =>
      expect(lastQuery().get("priceSearchRequest.priceFrom")).toBe("200"),
    );
    expect(
      lastQuery().get("itemOptionSearchRequest.attackMaxSearch.attackMaxFrom"),
    ).toBe("10");
    fireEvent.click(screen.getByRole("button", { name: "Clear options" }));
    await waitFor(() =>
      expect(
        lastQuery().has(
          "itemOptionSearchRequest.attackMaxSearch.attackMaxFrom",
        ),
      ).toBe(false),
    );
  });

  it("최초 실패를 빈 결과와 구분하고 다시 시도로 복구한다", async () => {
    fetchSpy
      .mockResolvedValueOnce(Response.json({}, { status: 500 }))
      .mockResolvedValue(response(["복구된 거래"]));
    renderPage();
    await screen.findByText("거래내역을 불러오지 못했습니다.");
    expect(screen.queryByTestId("trade-log-list")).not.toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "다음 페이지" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(await screen.findByText("복구된 거래")).toBeInTheDocument();
    expect(
      screen.queryByText("거래내역을 불러오지 못했습니다."),
    ).not.toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("같은 조건의 재조회 실패는 기존 거래와 건수를 유지한다", async () => {
    fetchSpy
      .mockResolvedValueOnce(response(["기존 거래"]))
      .mockRejectedValue(new Error("offline"));
    renderPage();
    await screen.findByText("기존 거래");
    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: ["auction-history"] });
    });
    await screen.findByText(
      "거래내역을 갱신하지 못했습니다. 이전 결과를 표시합니다.",
    );
    expect(screen.getByText("기존 거래")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    fetchSpy.mockResolvedValue(response(["최신 거래"]));
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(await screen.findByText("최신 거래")).toBeInTheDocument();
    expect(screen.queryByText("기존 거래")).not.toBeInTheDocument();
  });

  it("검색 조건 변경 후 실패하면 이전 조건의 결과를 표시하지 않는다", async () => {
    fetchSpy
      .mockResolvedValueOnce(response(["이전 조건 거래"]))
      .mockRejectedValue(new Error("offline"));
    renderPage();
    await screen.findByText("이전 조건 거래");
    fireEvent.click(screen.getByRole("button", { name: "Direct Search" }));
    await screen.findByText("거래내역을 불러오지 못했습니다.");
    expect(screen.queryByText("이전 조건 거래")).not.toBeInTheDocument();
  });

  it("성공한 빈 응답은 오류 없이 0건으로 표시한다", async () => {
    fetchSpy.mockResolvedValue(response([]));
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId("trade-log-list")).toHaveAttribute(
        "aria-busy",
        "false",
      ),
    );
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "다시 시도" }),
    ).not.toBeInTheDocument();
  });
});
