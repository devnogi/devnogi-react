import { fireEvent, render, screen } from "@testing-library/react";

import { useInfiniteHornBugle } from "@/hooks/useInfiniteHornBugle";

import HornBugleClient from "./HornBugleClient";

let query = "";
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
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  }
  Object.defineProperty(globalThis, "IntersectionObserver", {
    configurable: true,
    value: IntersectionObserverMock,
  });
});

beforeEach(() => {
  query = "";
  replace.mockClear();
  jest.mocked(useInfiniteHornBugle).mockReturnValue({
    data: { pages: [{ items: [], meta: { isLast: true } }] },
    isLoading: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: jest.fn(),
  } as unknown as ReturnType<typeof useInfiniteHornBugle>);
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
