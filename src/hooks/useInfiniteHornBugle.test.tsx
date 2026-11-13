import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import { useInfiniteHornBugle } from "./useInfiniteHornBugle";

function payload(page = 1, ids = [page * 10 + 1, page * 10 + 2]) {
  return {
    success: true,
    data: {
      items: ids.map((id) => ({
        id,
        serverName: "류트",
        characterName: `캐릭터 ${id}`,
        message: `메시지 ${id}`,
        dateSend: "2026-11-14T12:00:00Z",
        dateRegister: "2026-11-14T12:00:00Z",
      })),
      meta: {
        currentPage: page,
        pageSize: 20,
        totalPages: 3,
        totalElements: 60,
        isFirst: page === 1,
        isLast: page === 3,
      },
    },
  };
}
function response(body: unknown, status = 200) {
  return { ok: status === 200, status, json: async () => body } as Response;
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
const clients: QueryClient[] = [];
function setup(serverName = "류트") {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  clients.push(client);
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  }
  return renderHook(
    ({ serverName: server }) => useInfiniteHornBugle({ serverName: server }),
    { initialProps: { serverName }, wrapper: Wrapper },
  );
}
let fetchMock: jest.SpyInstance;
beforeEach(() => {
  fetchMock = jest.spyOn(global, "fetch").mockImplementation(async (input) => {
    const page = Number(
      new URL(String(input), "http://localhost").searchParams.get("page"),
    );
    return response(payload(page));
  });
});
afterEach(() => {
  clients.forEach((client) => client.clear());
  clients.length = 0;
  focusManager.setFocused(true);
  onlineManager.setOnline(true);
  jest.useRealTimers();
  jest.restoreAllMocks();
});

it("checks only the first page every minute without replacing three displayed pages", async () => {
  jest.useFakeTimers();
  const { result } = setup();
  await act(async () => {
    await jest.advanceTimersByTimeAsync(1);
  });
  expect(result.current.data?.pages).toHaveLength(1);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  await act(async () => {
    await result.current.fetchNextPage();
    await jest.advanceTimersByTimeAsync(1);
  });
  await act(async () => {
    await result.current.fetchNextPage();
    await jest.advanceTimersByTimeAsync(1);
  });
  const displayed = result.current.data;
  fetchMock.mockResolvedValue(response(payload(1, [99, 98])));
  await act(async () => {
    await jest.advanceTimersByTimeAsync(59_000);
  });
  expect(fetchMock).toHaveBeenCalledTimes(3);
  await act(async () => {
    await jest.advanceTimersByTimeAsync(1_000);
  });
  expect(fetchMock).toHaveBeenCalledTimes(4);
  expect(String(fetchMock.mock.calls[3][0])).toContain("page=1&size=20");
  expect(result.current.data).toBe(displayed);
  expect(result.current.hasNewMessages).toBe(true);
});

it("pauses checking while hidden and checks only the head on stale focus and reconnect", async () => {
  jest.useFakeTimers();
  const { result } = setup();
  await act(async () => {
    await jest.advanceTimersByTimeAsync(1);
  });
  await act(async () => {
    await result.current.fetchNextPage();
  });
  act(() => focusManager.setFocused(false));
  await act(async () => {
    await jest.advanceTimersByTimeAsync(61_000);
  });
  expect(fetchMock).toHaveBeenCalledTimes(2);
  await act(async () => {
    focusManager.setFocused(true);
    await jest.advanceTimersByTimeAsync(1);
  });
  expect(fetchMock).toHaveBeenCalledTimes(3);
  act(() => onlineManager.setOnline(false));
  await act(async () => {
    await jest.advanceTimersByTimeAsync(61_000);
  });
  expect(fetchMock).toHaveBeenCalledTimes(3);
  await act(async () => {
    onlineManager.setOnline(true);
    await jest.advanceTimersByTimeAsync(1);
  });
  expect(fetchMock).toHaveBeenCalledTimes(4);
  expect(
    fetchMock.mock.calls
      .slice(2)
      .every(([url]) => String(url).includes("page=1&size=20")),
  ).toBe(true);
});

it("deduplicates manual refresh, retains pages on failure and replaces them only after success", async () => {
  const { result } = setup();
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  await act(async () => {
    await result.current.fetchNextPage();
  });
  await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));
  const displayed = result.current.data;
  const checkedAt = result.current.lastCheckedAt;
  const pending = deferred<Response>();
  fetchMock.mockReturnValueOnce(pending.promise);
  let first!: Promise<boolean>;
  act(() => {
    first = result.current.refreshLatest();
    expect(result.current.refreshLatest()).toBe(first);
  });
  expect(result.current.data).toBe(displayed);
  await act(async () => {
    pending.resolve(response({}, 500));
    expect(await first).toBe(false);
  });
  expect(result.current.data).toBe(displayed);
  expect(result.current.lastCheckedAt).toBe(checkedAt);
  expect(result.current.refreshError).toBeTruthy();
  fetchMock.mockResolvedValueOnce(response(payload(1, [100, 99])));
  await act(async () => {
    expect(await result.current.refreshLatest()).toBe(true);
  });
  expect(result.current.data?.pageParams).toEqual([1]);
  expect(result.current.data?.pages[0].items[0].id).toBe(100);
  expect(result.current.refreshError).toBeNull();
  await act(async () => {
    await result.current.fetchNextPage();
  });
  expect(String(fetchMock.mock.calls.at(-1)?.[0])).toContain("page=2&size=20");
});

it("cancels an in-flight next page before installing the successful new first page", async () => {
  const { result } = setup();
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  const next = deferred<Response>();
  fetchMock.mockReturnValueOnce(next.promise);
  act(() => {
    void result.current.fetchNextPage();
  });
  const signal = fetchMock.mock.calls.at(-1)?.[1].signal as AbortSignal;
  fetchMock.mockResolvedValueOnce(response(payload(1, [100, 99])));
  await act(async () => {
    expect(await result.current.refreshLatest()).toBe(true);
  });
  expect(signal.aborted).toBe(true);
  await act(async () => {
    next.resolve(response(payload(2)));
  });
  expect(result.current.data?.pages).toHaveLength(1);
  expect(result.current.data?.pages[0].items[0].id).toBe(100);
});

it("does not apply a refresh response to a different filter", async () => {
  const { result, rerender } = setup();
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  const old = deferred<Response>();
  fetchMock.mockReturnValueOnce(old.promise);
  let refresh!: Promise<boolean>;
  act(() => {
    refresh = result.current.refreshLatest();
  });
  const signal = fetchMock.mock.calls.at(-1)?.[1].signal as AbortSignal;
  rerender({ serverName: "하프" });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(signal.aborted).toBe(true);
  await act(async () => {
    old.resolve(response(payload(1, [999])));
    expect(await refresh).toBe(false);
  });
  expect(result.current.data?.pages[0].items[0].id).toBe(11);
  expect(result.current.refreshError).toBeNull();
  rerender({ serverName: "류트" });
  await waitFor(() => expect(result.current.isRefreshing).toBe(false));
  expect(result.current.data?.pages[0].items[0].id).toBe(11);
  await act(async () => {
    expect(await result.current.refreshLatest()).toBe(true);
  });
});

it("keeps prior pages after next-page failure and retries the same next page", async () => {
  const { result } = setup();
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  const displayed = result.current.data;
  fetchMock.mockResolvedValueOnce(response({}, 500));
  await act(async () => {
    await result.current.fetchNextPage();
  });
  await waitFor(() => expect(result.current.isFetchNextPageError).toBe(true));
  expect(result.current.data).toBe(displayed);
  await act(async () => {
    await result.current.fetchNextPage();
  });
  await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));
  expect(result.current.isFetchNextPageError).toBe(false);
});

it.each([
  { success: false, data: payload().data },
  { success: true, data: null },
  { success: true, data: { items: [] } },
])(
  "rejects malformed or unsuccessful envelopes and recovers via manual retry: %j",
  async (body) => {
    fetchMock.mockResolvedValueOnce(response(body));
    const { result } = setup();
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
    await act(async () => {
      expect(await result.current.refreshLatest()).toBe(true);
    });
    expect(result.current.data?.pages[0].items).toHaveLength(2);
  },
);
