import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { useInfiniteHornBugle } from "@/hooks/useInfiniteHornBugle";

import HornBugleClient from "./HornBugleClient";

let query = "";
let intersection: IntersectionObserverCallback;
const replace = jest.fn((url: string) => {
  query = url.split("?")[1] ?? "";
});

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/horn-bugle",
  useSearchParams: () => new URLSearchParams(query),
}));
jest.mock("@/hooks/useInfiniteHornBugle", () => ({
  useInfiniteHornBugle: jest.fn(),
}));

beforeAll(() => {
  class IntersectionObserverMock {
    constructor(callback: IntersectionObserverCallback) {
      intersection = callback;
    }
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  }
  Object.defineProperty(globalThis, "IntersectionObserver", {
    configurable: true,
    value: IntersectionObserverMock,
  });
});

const message = {
  id: 1,
  serverName: "류트",
  characterName: "테스터",
  message: "읽던 메시지",
  dateSend: "2026-11-14T12:00:00Z",
  dateRegister: "2026-11-14T12:00:00Z",
};
function queryState(overrides: Record<string, unknown> = {}) {
  return {
    data: { pages: [{ items: [], meta: { isLast: true } }] },
    isLoading: false,
    isError: false,
    isFetching: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    hasNextPage: false,
    fetchNextPage: jest.fn(),
    refreshLatest: jest.fn().mockResolvedValue(true),
    isRefreshing: false,
    refreshError: null,
    checkError: null,
    isChecking: false,
    hasNewMessages: false,
    lastCheckedAt: 0,
    ...overrides,
  } as unknown as ReturnType<typeof useInfiniteHornBugle>;
}

beforeEach(() => {
  query = "";
  replace.mockClear();
  Element.prototype.scrollIntoView = jest.fn();
  jest.mocked(useInfiniteHornBugle).mockReturnValue(queryState());
});

it("처음 조회 실패를 빈 목록과 구분하고 다시 시도한다", async () => {
  const state = queryState({ data: undefined, isError: true });
  jest.mocked(useInfiniteHornBugle).mockReturnValue(state);
  render(<HornBugleClient />);
  expect(
    screen.getByText("뿔피리 정보를 불러오지 못했습니다."),
  ).toBeInTheDocument();
  expect(screen.queryByText(/검색 결과가 없습니다/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
  await waitFor(() => expect(state.refreshLatest).toHaveBeenCalledTimes(1));
});

it("새 메시지를 알려도 읽던 목록을 유지하고 명시적 적용 성공 후에만 스크롤한다", async () => {
  const state = queryState({
    data: { pages: [{ items: [message], meta: { isLast: true } }] },
    hasNewMessages: true,
  });
  jest.mocked(useInfiniteHornBugle).mockReturnValue(state);
  render(<HornBugleClient />);
  expect(screen.getByText("새 메시지가 있습니다")).toBeInTheDocument();
  expect(screen.getByText("읽던 메시지")).toBeInTheDocument();
  expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "최신 목록 보기" }));
  await waitFor(() =>
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1),
  );
});

it("갱신 실패 시 읽던 메시지를 유지하고 스크롤하지 않는다", async () => {
  const refreshLatest = jest.fn().mockResolvedValue(false);
  jest.mocked(useInfiniteHornBugle).mockReturnValue(
    queryState({
      data: { pages: [{ items: [message], meta: { isLast: true } }] },
      refreshError: new Error("failed"),
      refreshLatest,
    }),
  );
  render(<HornBugleClient />);
  expect(screen.getByText("읽던 메시지")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
  await waitFor(() => expect(refreshLatest).toHaveBeenCalledTimes(1));
  expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
});

it("다음 페이지 실패 시 자동 요청을 멈추고 하단에서만 재시도한다", () => {
  const fetchNextPage = jest.fn();
  jest.mocked(useInfiniteHornBugle).mockReturnValue(
    queryState({
      data: { pages: [{ items: [message], meta: { isLast: false } }] },
      isError: true,
      isFetchNextPageError: true,
      hasNextPage: true,
      fetchNextPage,
    }),
  );
  render(<HornBugleClient />);
  intersection(
    [{ isIntersecting: true } as IntersectionObserverEntry],
    {} as IntersectionObserver,
  );
  expect(fetchNextPage).not.toHaveBeenCalled();
  expect(screen.getByText("읽던 메시지")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
  expect(fetchNextPage).toHaveBeenCalledWith({ cancelRefetch: false });
});

it("통합 검색어를 URL에 기록하고 선택한 서버 탭을 유지한다", () => {
  const { rerender } = render(<HornBugleClient />);
  fireEvent.click(screen.getByRole("button", { name: "류트" }));
  fireEvent.change(
    screen.getByRole("searchbox", { name: "뿔피리 통합 검색어" }),
    {
      target: { value: "나오 축복" },
    },
  );
  fireEvent.submit(screen.getByRole("search", { name: "거대한 뿔피리 검색" }));

  expect(replace).toHaveBeenLastCalledWith(
    "/horn-bugle?keyword=%EB%82%98%EC%98%A4+%EC%B6%95%EB%B3%B5",
    { scroll: false },
  );
  rerender(<HornBugleClient />);
  expect(useInfiniteHornBugle).toHaveBeenLastCalledWith({
    serverName: "류트",
    keyword: "나오 축복",
  });
  expect(screen.getByRole("button", { name: "류트" })).toHaveClass(
    "bg-[var(--color-ds-card)]",
  );
});

it("검색어 지우기는 keyword만 제거하고 서버 탭을 유지한다", () => {
  query = "keyword=%EB%A5%98%ED%8A%B8";
  const { rerender } = render(<HornBugleClient />);
  fireEvent.click(screen.getByRole("button", { name: "하프" }));
  fireEvent.click(screen.getByRole("button", { name: "검색어 지우기" }));

  expect(replace).toHaveBeenLastCalledWith("/horn-bugle", { scroll: false });
  rerender(<HornBugleClient />);
  expect(useInfiniteHornBugle).toHaveBeenLastCalledWith({
    serverName: "하프",
    keyword: undefined,
  });
});
