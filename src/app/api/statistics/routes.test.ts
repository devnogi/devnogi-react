import { NextRequest } from "next/server";

import { createServerAxios } from "@/lib/api/server";
import mockGateway from "@/mocks/data/statisticsData.json";

import { GET as dailyItems } from "./daily/items/route";
import { GET as dailySubs } from "./daily/subcategories/route";
import { GET as dailyTops } from "./daily/top-categories/route";
import { GET as weeklyItems } from "./weekly/items/route";
import { GET as weeklySubs } from "./weekly/subcategories/route";
import { GET as weeklyTops } from "./weekly/top-categories/route";

jest.mock("@/lib/api/server", () => ({ createServerAxios: jest.fn() }));
const get = jest.fn();
beforeEach(() => {
  get.mockReset();
  jest.mocked(createServerAxios).mockReturnValue({ get } as never);
});
const routes = [
  ["daily", "items", dailyItems, mockGateway.itemDaily],
  ["weekly", "items", weeklyItems, mockGateway.itemWeekly],
  ["daily", "subcategories", dailySubs, mockGateway.subcategoryDaily],
  ["weekly", "subcategories", weeklySubs, mockGateway.subcategoryWeekly],
  ["daily", "top-categories", dailyTops, mockGateway.topCategoryDaily],
  ["weekly", "top-categories", weeklyTops, mockGateway.topCategoryWeekly],
] as const;

describe.each(routes)("%s/%s", (period, scope, handler, mockResponse) => {
  const request = () =>
    new NextRequest(
      "http://localhost/api/statistics/" +
        period +
        "/" +
        scope +
        "?itemName=sword&topCategory=equipment&subCategory=weapons&dateFrom=2026-12-28&dateTo=2027-01-03",
    );
  const identity =
    scope === "items"
      ? { itemName: "sword" }
      : scope === "subcategories"
        ? { itemSubCategory: "weapons" }
        : { itemTopCategory: "equipment" };
  const dateField = period === "daily" ? "dateAuctionBuy" : "weekStartDate";
  const raw = {
    id: 7,
    ...identity,
    [dateField]: "2026-12-28",
    minPrice: 1,
    maxPrice: 10,
    avgPrice: 9.5,
    totalVolume: 6,
    totalQuantity: 2,
  };
  it.each(["envelope", "array"])(
    "normalizes the %s and forwards the selected dates",
    async (format) => {
      get.mockResolvedValue({
        status: 200,
        data: format === "array" ? [raw] : { success: true, data: [raw] },
      });
      const response = await handler(request());
      expect(response.status).toBe(200);
      expect(get).toHaveBeenCalledWith(
        "/oab/statistics/" + period + "/" + scope,
        {
          params: {
            startDate: "2026-12-28",
            endDate: "2027-01-03",
            topCategory: "equipment",
            ...(scope !== "top-categories" && { subCategory: "weapons" }),
            ...(scope === "items" && { itemName: "sword" }),
          },
        },
      );
      expect((await response.json()).data).toEqual([
        {
          ...(scope === "items"
            ? {
                itemName: "sword",
                itemTopCategory: "equipment",
                itemSubCategory: "weapons",
              }
            : {
                topCategory: "equipment",
                ...(scope === "subcategories" && { subCategory: "weapons" }),
              }),
          ...(period === "daily"
            ? { date: "2026-12-28" }
            : { weekStart: "2026-12-28", weekEnd: "2027-01-03" }),
          minPrice: 1,
          maxPrice: 10,
          avgPrice: scope === "items" ? 3 : 9.5,
          totalVolume: 6,
          totalQuantity: 2,
        },
      ]);
    },
  );
  it("serves the configured MSW gateway fixture", async () => {
    get.mockResolvedValue({ status: 200, data: mockResponse });
    const response = await handler(request());
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data).toHaveLength(mockResponse.data.length);
    expect(body.data[0]).toMatchObject(
      period === "daily"
        ? { date: "2025-07-01" }
        : { weekStart: "2025-06-16", weekEnd: "2025-06-22" },
    );
  });
  it("returns valid empty arrays", async () => {
    get.mockResolvedValue({ status: 200, data: { success: true, data: [] } });
    const response = await handler(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true, data: [] });
  });
  it.each([
    ["unsuccessful response", { success: false, data: [] }],
    ["missing success", { data: [] }],
    ["null rows", { success: true, data: null }],
    [
      "missing identity",
      [
        {
          ...raw,
          ...Object.fromEntries(Object.keys(identity).map((k) => [k, null])),
        },
      ],
    ],
    ["invalid date", [{ ...raw, [dateField]: "2026-02-30" }]],
    ["invalid number", [{ ...raw, totalVolume: "6" }]],
  ])("rejects %s", async (_label, payload) => {
    get.mockResolvedValue({ status: 200, data: payload });
    const response = await handler(request());
    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ success: false });
  });
  it("preserves upstream HTTP failure status and body", async () => {
    const data = { success: false, code: "UPSTREAM_ERROR" };
    get.mockRejectedValue({
      isAxiosError: true,
      response: { status: 503, data },
    });
    const response = await handler(request());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual(data);
  });
});
