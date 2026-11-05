import { getAuctionDetail } from "@/lib/auction/detail";

import { generateMetadata } from "./page";

jest.mock("@/lib/auction/detail", () => ({
  getAuctionDetail: jest.fn(),
  safeReturnTo: jest.fn(),
}));

describe("auction realtime detail metadata", () => {
  it("uses the exact item title without the global template", async () => {
    jest.mocked(getAuctionDetail).mockResolvedValue({
      status: "available",
      source: "realtime",
      record: { itemName: "테스트 검" },
      dailyStatistics: [],
      weeklyStatistics: [],
    } as never);
    const metadata = await generateMetadata({
      params: Promise.resolve({ auctionId: "10" }),
      searchParams: Promise.resolve({}),
    });
    expect(metadata.title).toEqual({
      absolute: "테스트 검 실시간 거래 | 마비노기",
    });
  });
});
