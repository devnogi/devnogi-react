import { getAuctionDetail, getKstDateRange, safeReturnTo } from "./detail";

const record = {
  itemName: "롱소드",
  itemDisplayName: "강한 롱소드",
  itemCount: 2,
  auctionPricePerUnit: 1200,
  dateAuctionBuy: "2026-11-05T10:00:00",
  auctionBuyId: "history-success",
  itemSubCategory: "검",
  itemTopCategory: "근거리 장비",
  itemOptions: [],
};

const itemInfoPage = {
  content: [
    {
      name: "롱소드",
      topCategory: "근거리 장비",
      subCategory: "검",
      description: "한손검",
      inventoryWidth: 1,
      inventoryHeight: 3,
      inventoryMaxBundleCount: 1,
      history: null,
      acquisitionMethod: null,
      storeSalesPrice: null,
      weaponType: "검",
      repair: null,
      maxAlterationCount: 5,
    },
  ],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 10,
  first: true,
  last: true,
  empty: false,
};

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(data),
  } as unknown as Response;
}

function successFetch(input: RequestInfo | URL) {
  const url = String(input);
  if (url.includes("/auction-history/")) return jsonResponse(record);
  if (url.includes("/item-infos/detail")) return jsonResponse(itemInfoPage);
  if (url.includes("/statistics/daily/items"))
    return jsonResponse([
      {
        itemName: "롱소드",
        dateAuctionBuy: "2026-11-05",
        minPrice: 1000,
        maxPrice: 1500,
        avgPrice: 9999,
        totalVolume: 5000,
        totalQuantity: 4,
      },
    ]);
  return jsonResponse([
    {
      itemName: "롱소드",
      weekStartDate: "2026-11-02",
      minPrice: 900,
      maxPrice: 1600,
      avgPrice: 9999,
      totalVolume: 6000,
      totalQuantity: 4,
    },
  ]);
}

describe("safeReturnTo", () => {
  it("accepts only the matching auction list path", () => {
    expect(
      safeReturnTo("history", "/auction-history?page=3&item_name=%EA%B2%80"),
    ).toBe("/auction-history?page=3&item_name=%EA%B2%80");
    expect(safeReturnTo("realtime", "/auction-realtime?page=2")).toBe(
      "/auction-realtime?page=2",
    );
  });

  it("rejects external and cross-source return URLs", () => {
    expect(
      safeReturnTo("history", "https://evil.example/auction-history"),
    ).toBe("/auction-history");
    expect(safeReturnTo("history", "/auction-realtime?page=2")).toBe(
      "/auction-history",
    );
    expect(safeReturnTo("realtime", undefined)).toBe("/auction-realtime");
  });
});

describe("getKstDateRange", () => {
  it("uses the Asia/Seoul calendar day across KST midnight", () => {
    expect(getKstDateRange(30, new Date("2026-11-04T14:59:59Z"))).toEqual({
      startDate: "2026-10-06",
      endDate: "2026-11-04",
    });
    expect(getKstDateRange(30, new Date("2026-11-04T15:00:00Z"))).toEqual({
      startDate: "2026-10-07",
      endDate: "2026-11-05",
    });
    expect(getKstDateRange(120, new Date("2026-11-04T15:00:00Z"))).toEqual({
      startDate: "2026-07-09",
      endDate: "2026-11-05",
    });
  });
});

describe("getAuctionDetail", () => {
  const originalGatewayUrl = process.env.GATEWAY_URL;

  beforeEach(() => {
    process.env.GATEWAY_URL = "http://gateway.test";
    jest.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.GATEWAY_URL = originalGatewayUrl;
  });

  it("loads the record and independent detail sections with bounded requests", async () => {
    jest.mocked(fetch).mockImplementation(async (input) => successFetch(input));

    const result = await getAuctionDetail("history", "success-1");

    expect(result.status).toBe("available");
    expect(result.itemInfoStatus).toBe("available");
    expect(result.dailyStatus).toBe("available");
    expect(result.weeklyStatus).toBe("available");
    expect(result.dailyStatistics[0].avgPrice).toBe(1250);
    expect(result.weeklyStatistics[0]).toMatchObject({
      avgPrice: 1500,
      weekEnd: "2026-11-08",
    });
    expect(fetch).toHaveBeenCalledTimes(4);
    for (const [, init] of jest.mocked(fetch).mock.calls) {
      expect(init?.signal).toBeInstanceOf(AbortSignal);
    }
    const statisticUrls = jest
      .mocked(fetch)
      .mock.calls.map(([input]) => String(input))
      .filter((url) => url.includes("/statistics/"));
    expect(statisticUrls).toHaveLength(2);
    for (const url of statisticUrls) {
      const params = new URL(url).searchParams;
      expect(params.get("itemName")).toBe("롱소드");
      expect(params.get("topCategory")).toBe("근거리 장비");
      expect(params.get("subCategory")).toBe("검");
      expect(params.get("startDate")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(params.get("endDate")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("loads the realtime wire ID and registration date without alias fields", async () => {
    const realtime = {
      id: 123,
      itemName: "롱소드",
      itemDisplayName: "강한 롱소드",
      itemCount: 2,
      auctionPricePerUnit: 1200,
      dateRegister: "2026-11-05T09:00:00Z",
      dateAuctionExpire: "2026-11-08T09:00:00Z",
      itemSubCategory: "검",
      itemTopCategory: "근거리 장비",
      itemOptions: [],
    };
    jest
      .mocked(fetch)
      .mockImplementation(async (input) =>
        String(input).includes("/auction-realtime/")
          ? jsonResponse({ success: true, data: realtime })
          : successFetch(input),
      );
    const result = await getAuctionDetail("realtime", "123");
    expect(result.status).toBe("available");
    expect(result.record).toEqual(realtime);
    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it.each([
    "undefined",
    "null",
    "0",
    "-1",
    "1.5",
    "abc",
    "1e3",
    " 12",
    "9007199254740992",
  ])("rejects invalid realtime URL ID %s before any request", async (id) => {
    await expect(getAuctionDetail("realtime", id)).resolves.toMatchObject({
      status: "not-found",
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns an error for a realtime record without its wire ID", async () => {
    jest
      .mocked(fetch)
      .mockResolvedValueOnce(
        jsonResponse({ ...record, dateRegister: "2026-11-05" }),
      );
    await expect(getAuctionDetail("realtime", "123")).resolves.toMatchObject({
      status: "error",
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it.each(["optionDesc", "optionSubType", "optionValue2"])(
    "rejects unsafe realtime %s before rendering or dependent requests",
    async (field) => {
      jest.mocked(fetch).mockResolvedValueOnce(
        jsonResponse({
          ...record,
          id: 123,
          dateRegister: "2026-11-05",
          dateAuctionExpire: "2026-11-08",
          itemOptions: [
            {
              optionType: "인챈트",
              optionValue: "x",
              optionSubType: "접두",
              [field]: 123,
            },
          ],
        }),
      );
      await expect(getAuctionDetail("realtime", "123")).resolves.toMatchObject({
        status: "error",
      });
      expect(fetch).toHaveBeenCalledTimes(1);
    },
  );

  it("distinguishes a missing primary record from a primary timeout", async () => {
    jest.mocked(fetch).mockResolvedValueOnce(jsonResponse({}, 404));
    await expect(
      getAuctionDetail("history", "missing-1"),
    ).resolves.toMatchObject({ status: "not-found" });

    jest
      .mocked(fetch)
      .mockRejectedValueOnce(new DOMException("timed out", "TimeoutError"));
    await expect(
      getAuctionDetail("history", "timeout-1"),
    ).resolves.toMatchObject({ status: "error" });

    jest.mocked(fetch).mockResolvedValueOnce(jsonResponse({}, 500));
    await expect(
      getAuctionDetail("history", "gateway-error-1"),
    ).resolves.toMatchObject({ status: "error" });
  });

  it("keeps successful sections when one dependent request times out", async () => {
    jest.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/auction-history/")) return jsonResponse(record);
      if (url.includes("/item-infos/detail"))
        throw new DOMException("timed out", "TimeoutError");
      return successFetch(input);
    });

    const result = await getAuctionDetail("history", "partial-timeout-1");

    expect(result).toMatchObject({
      status: "available",
      itemInfoStatus: "error",
      dailyStatus: "available",
      weeklyStatus: "available",
    });
    expect(result.itemInfo).toBeUndefined();
    expect(result.dailyStatistics).toHaveLength(1);
  });

  it("reports successful empty sections separately from failed sections", async () => {
    jest.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/auction-history/")) return jsonResponse(record);
      if (url.includes("/item-infos/detail"))
        return jsonResponse({ ...itemInfoPage, content: [], empty: true });
      if (url.includes("/statistics/daily/items")) return jsonResponse([]);
      throw new Error("weekly unavailable");
    });

    const result = await getAuctionDetail("history", "empty-and-error-1");

    expect(result).toMatchObject({
      itemInfoStatus: "empty",
      dailyStatus: "empty",
      weeklyStatus: "error",
    });
  });
});
