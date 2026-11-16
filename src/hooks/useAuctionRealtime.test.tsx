import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";

import { useAuctionRealtime } from "./useAuctionRealtime";

const item = {
  id: 123,
  itemName: "불타래",
  itemDisplayName: "불타래",
  itemCount: 6,
  auctionPricePerUnit: 136,
  dateRegister: "2026-11-14T00:00:00Z",
  dateAuctionExpire: "2026-11-17T00:00:00Z",
  itemSubCategory: "불타래",
  itemTopCategory: "기타",
  itemOptions: [],
};
const data = {
  items: [item],
  meta: {
    currentPage: 1,
    pageSize: 20,
    totalPages: 1,
    totalElements: 1,
    isFirst: true,
    isLast: true,
  },
};
let client: QueryClient;

function renderQuery(params = { itemName: "불타래" }) {
  return renderHook(() => useAuctionRealtime(params), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
}

async function advance(ms: number) {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(ms);
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-11-14T00:00:00Z"));
  focusManager.setFocused(true);
  onlineManager.setOnline(true);
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  jest
    .spyOn(global, "fetch")
    .mockImplementation(
      async () => new Response(JSON.stringify({ success: true, data })),
    );
});

afterEach(() => {
  client.clear();
  focusManager.setFocused(undefined);
  onlineManager.setOnline(true);
  jest.restoreAllMocks();
  jest.useRealTimers();
});

it("reads wire data with no-store and a cancellable request", async () => {
  const { result, unmount } = renderQuery();
  await advance(1);
  expect(result.current.data).toEqual(data);
  expect(fetch).toHaveBeenCalledWith(
    "/api/auction-realtime/search?itemName=%EB%B6%88%ED%83%80%EB%9E%98",
    { cache: "no-store", signal: expect.any(AbortSignal) },
  );
  unmount();
});

it("checks every 60 seconds in a visible tab, pauses hidden checks and refreshes stale data on return", async () => {
  const { result } = renderQuery();
  await advance(1);
  expect(result.current.isSuccess).toBe(true);
  await advance(59_000);
  expect(fetch).toHaveBeenCalledTimes(1);
  await advance(1_000);
  expect(fetch).toHaveBeenCalledTimes(2);
  act(() => focusManager.setFocused(false));
  await advance(120_000);
  expect(fetch).toHaveBeenCalledTimes(2);
  act(() => focusManager.setFocused(true));
  await advance(1);
  expect(fetch).toHaveBeenCalledTimes(3);
});

it("rechecks stale data on reconnect", async () => {
  renderQuery();
  await advance(1);
  act(() => {
    focusManager.setFocused(false);
    onlineManager.setOnline(false);
  });
  await advance(60_000);
  expect(fetch).toHaveBeenCalledTimes(1);
  act(() => onlineManager.setOnline(true));
  await advance(1);
  expect(fetch).toHaveBeenCalledTimes(2);
});

it.each([
  { success: false, data },
  { success: true, data: null },
  { success: true, data: { ...data, items: [{ ...item, id: undefined }] } },
])("exposes malformed or unsuccessful responses as errors", async (payload) => {
  jest
    .mocked(fetch)
    .mockImplementation(async () => new Response(JSON.stringify(payload)));
  const { result } = renderQuery();
  await advance(1);
  expect(result.current.isError).toBe(true);
  expect(result.current.data).toBeUndefined();
});

it("retains the last successful same-query data and timestamp when a refresh fails", async () => {
  const { result } = renderQuery();
  await advance(1);
  const successfulAt = result.current.dataUpdatedAt;
  expect(result.current.isError).toBe(false);
  jest
    .mocked(fetch)
    .mockImplementation(
      async () => new Response("unavailable", { status: 503 }),
    );
  await advance(60_010);
  expect(result.current.isError).toBe(true);
  expect(result.current.data).toEqual(data);
  expect(result.current.dataUpdatedAt).toBe(successfulAt);
});

it("aborts an in-flight request when its query is unmounted", async () => {
  jest.mocked(fetch).mockImplementation(() => new Promise(() => {}));
  const { unmount } = renderQuery();
  const signal = jest.mocked(fetch).mock.calls[0][1]?.signal;
  expect(signal?.aborted).toBe(false);
  unmount();
  expect(signal?.aborted).toBe(true);
});
