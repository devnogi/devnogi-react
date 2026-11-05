import { NextRequest } from "next/server";

import { createServerAxios } from "@/lib/api/server";

import { GET as getDaily } from "./daily/items/route";
import { GET as getWeekly } from "./weekly/items/route";

jest.mock("@/lib/api/server", () => ({ createServerAxios: jest.fn() }));

describe("item statistics BFF normalization", () => {
  const get = jest.fn();

  beforeEach(() => {
    get.mockReset();
    jest.mocked(createServerAxios).mockReturnValue({ get } as never);
  });

  it("maps daily date params and returns weighted averages", async () => {
    get.mockResolvedValue({
      status: 200,
      data: [
        {
          itemName: "검",
          dateAuctionBuy: "2026-11-01",
          minPrice: 100,
          maxPrice: 300,
          avgPrice: 999,
          totalVolume: 600,
          totalQuantity: 3,
        },
      ],
    });
    const response = await getDaily(
      new NextRequest(
        "http://localhost/api/statistics/daily/items?itemName=%EA%B2%80&topCategory=%EC%9E%A5%EB%B9%84&subCategory=%EA%B2%80&dateFrom=2026-10-07&dateTo=2026-11-05",
      ),
    );
    const body = await response.json();
    expect(get).toHaveBeenCalledWith(expect.any(String), {
      params: expect.objectContaining({
        startDate: "2026-10-07",
        endDate: "2026-11-05",
      }),
    });
    expect(body.data[0]).toMatchObject({
      date: "2026-11-01",
      avgPrice: 200,
      itemTopCategory: "장비",
      itemSubCategory: "검",
    });
  });

  it("normalizes weekly dates and weighted averages", async () => {
    get.mockResolvedValue({
      status: 200,
      data: [
        {
          itemName: "검",
          weekStartDate: "2026-11-02",
          minPrice: 100,
          maxPrice: 300,
          avgPrice: 999,
          totalVolume: 1000,
          totalQuantity: 4,
        },
      ],
    });
    const response = await getWeekly(
      new NextRequest(
        "http://localhost/api/statistics/weekly/items?itemName=%EA%B2%80&topCategory=%EC%9E%A5%EB%B9%84&subCategory=%EA%B2%80&dateFrom=2026-07-09&dateTo=2026-11-05",
      ),
    );
    const body = await response.json();
    expect(get).toHaveBeenCalledWith(expect.any(String), {
      params: expect.objectContaining({
        startDate: "2026-07-09",
        endDate: "2026-11-05",
      }),
    });
    expect(body.data[0]).toMatchObject({
      weekStart: "2026-11-02",
      weekEnd: "2026-11-08",
      avgPrice: 250,
    });
  });
});
