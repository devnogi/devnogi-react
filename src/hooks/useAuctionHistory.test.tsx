import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";

import { useAuctionHistory } from "./useAuctionHistory";

const emptyData = {
  items: [],
  meta: {
    currentPage: 1,
    pageSize: 20,
    totalPages: 0,
    totalElements: 0,
    isFirst: true,
    isLast: true,
  },
};
let client: QueryClient;
let fetchSpy: jest.SpyInstance;
function wrapper({ children }: PropsWithChildren) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
beforeEach(() => {
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  fetchSpy = jest.spyOn(globalThis, "fetch");
});
afterEach(() => {
  cleanup();
  client.clear();
  fetchSpy.mockRestore();
});

it.each([
  ["failed envelope", { success: false, data: emptyData }],
  ["missing success", { data: emptyData }],
  ["null data", { success: true, data: null }],
  ["invalid items", { success: true, data: { ...emptyData, items: {} } }],
  ["null row", { success: true, data: { ...emptyData, items: [null] } }],
  ["missing pagination", { success: true, data: { items: [] } }],
  [
    "invalid count",
    {
      success: true,
      data: { ...emptyData, meta: { ...emptyData.meta, totalElements: "0" } },
    },
  ],
  ["null envelope", null],
])("treats %s as a request failure", async (_label, payload) => {
  fetchSpy.mockResolvedValue(Response.json(payload));
  const { result } = renderHook(() => useAuctionHistory({}), { wrapper });
  await waitFor(() => expect(result.current.isError).toBe(true));
  expect(result.current.data).toBeUndefined();
});

it("accepts successful empty results with zero pages", async () => {
  fetchSpy.mockResolvedValue(Response.json({ success: true, data: emptyData }));
  const { result } = renderHook(() => useAuctionHistory({}), { wrapper });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toEqual(emptyData);
});

const historyItem = {
  auctionBuyId: "123",
  itemName: "wood",
  itemDisplayName: "wood",
  itemTopCategory: "other",
  itemSubCategory: "other",
  dateAuctionBuy: "2026-11-14",
  itemCount: 1,
  auctionPricePerUnit: 100,
};
it.each([
  null,
  {},
  { optionType: {}, optionValue: "1" },
  { optionType: "attack", optionValue: {} },
  { optionType: "attack", optionValue: "1", optionDesc: {} },
  { optionType: "attack", optionValue: "1", optionSubType: {} },
  { optionType: "durability", optionValue: "1", optionValue2: {} },
])("rejects malformed item option %j", async (option) => {
  fetchSpy.mockResolvedValue(
    Response.json({
      success: true,
      data: {
        ...emptyData,
        items: [{ ...historyItem, itemOptions: [option] }],
      },
    }),
  );
  const { result } = renderHook(() => useAuctionHistory({}), { wrapper });
  await waitFor(() => expect(result.current.isError).toBe(true));
  expect(result.current.data).toBeUndefined();
});
it.each([
  { optionType: "attack", optionValue: "1" },
  {
    optionType: "attack",
    optionValue: "1",
    optionDesc: null,
    optionSubType: null,
    optionValue2: null,
  },
  {
    optionType: "attack",
    optionValue: "1",
    optionDesc: "description",
    optionSubType: "max",
    optionValue2: "2",
  },
])("accepts optional option metadata %j", async (option) => {
  const data = {
    ...emptyData,
    items: [{ ...historyItem, itemOptions: [option] }],
  };
  fetchSpy.mockResolvedValue(Response.json({ success: true, data }));
  const { result } = renderHook(() => useAuctionHistory({}), { wrapper });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toEqual(data);
});
