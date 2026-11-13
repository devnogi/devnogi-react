import { getAuctionDetail } from "@/lib/auction/detail";

import { generateMetadata } from "./page";

jest.mock("@/lib/auction/detail", () => ({
  getAuctionDetail: jest.fn(),
  safeReturnTo: jest.fn(),
}));

describe("auction history detail metadata", () => {
  it("uses the exact item title without the global template", async () => {
    jest.mocked(getAuctionDetail).mockResolvedValue({
      status: "available",
      source: "history",
      record: { itemName: "테스트 검" },
      dailyStatistics: [],
      weeklyStatistics: [],
    } as never);
    const metadata = await generateMetadata({
      params: Promise.resolve({ auctionBuyId: "history-1" }),
      searchParams: Promise.resolve({}),
    });
    expect(metadata.title).toEqual({
      absolute: "테스트 검 거래 내역 | 마비노기",
    });
  });
});

it("uses a self canonical independent of return_to", async () => {
  jest.mocked(getAuctionDetail).mockResolvedValue({
    status: "available",
    record: { itemName: "검" },
  } as never);
  const result = await generateMetadata({
    params: Promise.resolve({ auctionBuyId: "record-1" }),
    searchParams: Promise.resolve({ return_to: "/auction-history?page=2" }),
  });
  expect(result.alternates?.canonical).toBe(
    "https://www.memonogi.com/auction-history/record-1",
  );
});
it("propagates missing and failed primary records", async () => {
  jest
    .mocked(getAuctionDetail)
    .mockResolvedValue({ status: "not-found" } as never);
  await expect(
    generateMetadata({
      params: Promise.resolve({ auctionBuyId: "missing" }),
      searchParams: Promise.resolve({}),
    }),
  ).rejects.toThrow();
  jest.mocked(getAuctionDetail).mockResolvedValue({ status: "error" } as never);
  await expect(
    generateMetadata({
      params: Promise.resolve({ auctionBuyId: "error" }),
      searchParams: Promise.resolve({}),
    }),
  ).rejects.toThrow();
});
