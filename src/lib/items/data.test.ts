import { getItemSeo, getItemStatistics } from "./data";
import { encodeItemKey } from "./identity";

const item = { name: "롱소드", topCategory: "근거리 장비", subCategory: "검" };
const response = (data: unknown, status = 200) =>
  ({ ok: status === 200, status, json: async () => data }) as Response;

beforeEach(() => {
  process.env.GATEWAY_URL = "http://gateway.test";
  jest.spyOn(globalThis, "fetch");
});
afterEach(() => jest.restoreAllMocks());

it("does not confuse missing catalogue items and transient errors", async () => {
  jest.mocked(fetch).mockResolvedValueOnce(response({}, 404));
  await expect(getItemSeo(encodeItemKey(item))).resolves.toBeNull();
  jest.mocked(fetch).mockResolvedValueOnce(response({}, 503));
  await expect(getItemSeo(encodeItemKey(item))).rejects.toThrow("503");
  jest.mocked(fetch).mockRejectedValueOnce(new Error("timeout"));
  await expect(getItemSeo(encodeItemKey(item))).rejects.toThrow("timeout");
});

it("preserves older retained statistics eligibility independently of recent windows", async () => {
  const data = {
    item,
    seoEligible: true,
    lastTrade: {
      periodType: "DAILY",
      periodStart: "2020-01-01",
      periodEnd: "2020-01-01",
      minPrice: 100,
      maxPrice: 200,
      avgPrice: 150,
      totalQuantity: 2,
      totalVolume: 300,
      updatedAt: null,
    },
  };
  jest
    .mocked(fetch)
    .mockResolvedValueOnce(response({ success: true, data }))
    .mockResolvedValue(response([]));
  await expect(getItemSeo(encodeItemKey(item))).resolves.toEqual(data);
  await expect(getItemStatistics(item)).resolves.toMatchObject({
    dailyStatus: "empty",
    weeklyStatus: "empty",
  });
});

it("distinguishes a failed statistics request from an empty period", async () => {
  jest
    .mocked(fetch)
    .mockResolvedValueOnce(response([], 500))
    .mockResolvedValueOnce(response([]));
  await expect(getItemStatistics(item)).resolves.toMatchObject({
    dailyStatus: "error",
    weeklyStatus: "empty",
  });
});
