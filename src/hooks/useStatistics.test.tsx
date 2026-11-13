import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";

import {
  useItemDailyStatistics,
  useItemWeeklyStatistics,
  useSubcategoryDailyStatistics,
  useSubcategoryWeeklyStatistics,
  useTopCategoryDailyStatistics,
  useTopCategoryWeeklyStatistics,
} from "./useStatistics";

const hooks = [
  ["item daily", useItemDailyStatistics],
  ["item weekly", useItemWeeklyStatistics],
  ["subcategory daily", useSubcategoryDailyStatistics],
  ["subcategory weekly", useSubcategoryWeeklyStatistics],
  ["top category daily", useTopCategoryDailyStatistics],
  ["top category weekly", useTopCategoryWeeklyStatistics],
] as const;
const params = {
  itemName: "나무장작",
  topCategory: "기타",
  subCategory: "기타",
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

describe.each(hooks)("%s response contract", (name, useStatistics) => {
  const dates = name.includes("daily")
    ? { date: "2026-11-14" }
    : { weekStart: "2026-11-09", weekEnd: "2026-11-15" };
  const row = {
    minPrice: 1,
    maxPrice: 2,
    avgPrice: 1.5,
    totalVolume: 3,
    totalQuantity: 2,
    ...dates,
  };
  it.each(
    Object.keys(dates).flatMap((field) => [
      [field, undefined],
      [field, null],
      [field, {}],
    ]),
  )("rejects invalid %s date %j", async (field, value) => {
    fetchSpy.mockResolvedValue(
      Response.json({
        success: true,
        data: [{ ...row, [field as string]: value }],
      }),
    );
    const { result } = renderHook(() => useStatistics(params), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
  it("accepts the date fields for the selected period", async () => {
    fetchSpy.mockResolvedValue(Response.json({ success: true, data: [row] }));
    const { result } = renderHook(() => useStatistics(params), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([row]);
  });

  it.each([
    ["failed envelope", { success: false, data: [] }],
    ["null data", { success: true, data: null }],
    ["non-array data", { success: true, data: {} }],
    ["malformed row", { success: true, data: [null] }],
    ["missing price fields", { success: true, data: [{ date: "2026-11-14" }] }],
    ["null envelope", null],
  ])("rejects %s instead of empty results", async (_label, payload) => {
    fetchSpy.mockResolvedValue(Response.json(payload));
    const { result } = renderHook(() => useStatistics(params), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });

  it("accepts a successful empty array", async () => {
    fetchSpy.mockResolvedValue(Response.json({ success: true, data: [] }));
    const { result } = renderHook(() => useStatistics(params), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});
