import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import AuctionRealtimeClient from "./AuctionRealtimeClient";

const mockRouter = { replace: jest.fn() };
let mockUrlParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/auction-realtime",
  useSearchParams: () => mockUrlParams,
}));
jest.mock("@/hooks/useItemCategories", () => {
  const categories = [{ id: "all", name: "전체", children: [] }];
  return { useItemCategories: () => ({ data: categories, isLoading: false }) };
});
jest.mock("@/hooks/useAuctionHistoryLayout", () => ({
  useAuctionHistoryLayout: () => ({
    layoutMode: "desktop",
    showCategorySidebar: false,
    showFilterSidebar: false,
    showMobileFilter: false,
  }),
}));
jest.mock("@/hooks/useAuctionItemPreviewPreference", () => ({
  useAuctionItemPreviewPreference: () => ({
    isPreviewEnabled: false,
    setIsPreviewEnabled: jest.fn(),
  }),
}));
jest.mock("@/components/page/auction-common/AuctionItemSearch", () => {
  return function Search({ onSearch }: { onSearch: (name: string) => void }) {
    return <button onClick={() => onSearch("다른 아이템")}>조건 변경</button>;
  };
});

function response(names = ["불타래"], page = 1, totalPages = 1) {
  return Response.json({
    success: true,
    data: {
      items: names.map((name, index) => ({
        id: 123 + index,
        itemName: name,
        itemDisplayName: name,
        itemCount: 1,
        auctionPricePerUnit: 100,
        dateRegister: "2026-11-14T10:00:00",
        dateAuctionExpire: "2026-11-17T10:00:00",
        itemTopCategory: "기타",
        itemSubCategory: "불타래",
        itemOptions: [],
      })),
      meta: {
        currentPage: page,
        pageSize: 20,
        totalPages,
        totalElements: names.length,
        isFirst: page === 1,
        isLast: page >= totalPages,
      },
    },
  });
}

let fetchSpy: jest.SpyInstance;
const clients: QueryClient[] = [];

beforeEach(() => {
  mockUrlParams = new URLSearchParams("item_name=불타래");
  mockRouter.replace.mockClear();
  fetchSpy = jest.spyOn(global, "fetch");
});
afterEach(() => {
  clients.forEach((client) => client.clear());
  clients.length = 0;
  jest.restoreAllMocks();
});

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  clients.push(client);
  return render(
    <QueryClientProvider client={client}>
      <AuctionRealtimeClient />
    </QueryClientProvider>,
  );
}

it("shows an initial error instead of empty results and retries the current query", async () => {
  fetchSpy.mockImplementation(async () => new Response(null, { status: 500 }));
  renderPage();
  await screen.findByText("현재 매물을 불러오지 못했습니다.");
  expect(screen.queryByText("검색 결과가 없습니다.")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "다음 페이지" }),
  ).not.toBeInTheDocument();
  const previousCalls = fetchSpy.mock.calls.length;
  const failedUrl = fetchSpy.mock.calls.at(-1)![0];
  fetchSpy.mockImplementation(async () => response());
  fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
  await screen.findAllByRole("link", { name: /불타래/ });
  expect(fetchSpy).toHaveBeenCalledTimes(previousCalls + 1);
  expect(fetchSpy.mock.calls.at(-1)![0]).toBe(failedUrl);
  expect(
    screen.queryByText("현재 매물을 불러오지 못했습니다."),
  ).not.toBeInTheDocument();
});

it("renders actual IDs and preserves results and last success time on refresh failure", async () => {
  fetchSpy.mockImplementation(async () => response());
  renderPage();
  const links = await screen.findAllByRole("link", { name: /불타래/ });
  expect(links).toHaveLength(2);
  links.forEach((link) =>
    expect(link.getAttribute("href")).toContain(
      "/auction-realtime/123?return_to=",
    ),
  );
  const lastChecked = screen.getByText(/^마지막 조회/).textContent;
  fetchSpy.mockImplementation(async () => new Response(null, { status: 500 }));
  fireEvent.click(screen.getByRole("button", { name: "새로고침" }));
  await screen.findByText("갱신하지 못했습니다. 이전 조회 결과를 표시합니다.");
  expect(screen.getAllByRole("link", { name: /불타래/ })).toHaveLength(2);
  expect(screen.getByText(/^마지막 조회/)).toHaveTextContent(lastChecked!);
});

it("only shows empty results for a successful empty response", async () => {
  fetchSpy.mockImplementation(async () => response([]));
  renderPage();
  expect(await screen.findByText("검색 결과가 없습니다.")).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "다시 시도" }),
  ).not.toBeInTheDocument();
});

it("does not label results from previous search conditions as the new query", async () => {
  fetchSpy.mockImplementation(async () => response());
  renderPage();
  await screen.findAllByRole("link", { name: /불타래/ });
  fetchSpy.mockImplementation(async () => new Response(null, { status: 500 }));
  fireEvent.click(screen.getByRole("button", { name: "조건 변경" }));
  await screen.findByText("현재 매물을 불러오지 못했습니다.");
  expect(
    screen.queryByRole("link", { name: /불타래/ }),
  ).not.toBeInTheDocument();
});

it("deduplicates manual refresh while keeping the selected page and sort", async () => {
  mockUrlParams = new URLSearchParams(
    "item_name=불타래&page=2&sort_by=auctionPricePerUnit&direction=asc",
  );
  let resolveRefresh: (value: Response) => void = () => {};
  fetchSpy.mockImplementation(async () => response(["불타래"], 2, 3));
  renderPage();
  await screen.findAllByRole("link", { name: /불타래/ });
  const previousCalls = fetchSpy.mock.calls.length;
  const previousUrl = fetchSpy.mock.calls.at(-1)![0];
  fetchSpy.mockImplementationOnce(
    () =>
      new Promise<Response>((resolve) => {
        resolveRefresh = resolve;
      }),
  );
  const button = screen.getByRole("button", { name: "새로고침" });
  fireEvent.click(button);
  fireEvent.click(button);
  await waitFor(() => expect(button).toBeDisabled());
  expect(fetchSpy).toHaveBeenCalledTimes(previousCalls + 1);
  expect(fetchSpy.mock.calls.at(-1)![0]).toBe(previousUrl);
  await act(async () => resolveRefresh(response(["불타래"], 2, 3)));
  await waitFor(() => expect(button).toBeEnabled());
});

it("clamps a removed page only after a successful response", async () => {
  mockUrlParams = new URLSearchParams("page=3&item_name=불타래");
  fetchSpy.mockImplementation(async (input: string) => {
    const page = Number(
      new URL(input, "http://localhost").searchParams.get("page"),
    );
    return page === 3 ? response([], 3, 2) : response(["남은 매물"], page, 2);
  });
  renderPage();
  await screen.findAllByRole("link", { name: /남은 매물/ });
  await waitFor(() =>
    expect(String(fetchSpy.mock.calls.at(-1)![0])).toContain("page=2"),
  );
  expect(
    fetchSpy.mock.calls.filter(([input]) => String(input).includes("page=2")),
  ).toHaveLength(1);
});
