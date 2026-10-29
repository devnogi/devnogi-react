import { getAuctionSearchMetadata } from "./seo";

describe("getAuctionSearchMetadata", () => {
  it("keeps a simple item query indexable with a normalized canonical URL", () => {
    const metadata = getAuctionSearchMetadata({ itemName: "검" });

    expect(metadata.alternates?.canonical).toBe(
      "https://www.memonogi.com/auction-history?item_name=%EA%B2%80",
    );
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });

  it("keeps pagination and sort variants out of the index", () => {
    const metadata = getAuctionSearchMetadata({
      item_name: "검",
      page: "2",
      sortBy: "auctionPricePerUnit",
    });

    expect(metadata.alternates?.canonical).toBe(
      "https://www.memonogi.com/auction-history",
    );
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it("keeps a category landing indexable", () => {
    const metadata = getAuctionSearchMetadata({
      top_category: "근거리 장비",
      sub_category: "검",
    });

    expect(metadata.alternates?.canonical).toBe(
      "https://www.memonogi.com/auction-history?top_category=%EA%B7%BC%EA%B1%B0%EB%A6%AC+%EC%9E%A5%EB%B9%84&sub_category=%EA%B2%80",
    );
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });
});
