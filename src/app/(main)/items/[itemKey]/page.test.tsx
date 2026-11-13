import { renderToStaticMarkup } from "react-dom/server";

import { getItemSeo, getItemStatistics } from "@/lib/items/data";
import { encodeItemKey, itemPath } from "@/lib/items/identity";

import ItemPage, { generateMetadata } from "./page";

jest.mock("@/lib/items/data", () => ({
  getItemSeo: jest.fn(),
  getItemStatistics: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("404");
  },
  permanentRedirect: (url: string) => {
    throw new Error(`308:${url}`);
  },
}));
jest.mock("@/components/page/statistics/PriceChart", () => () => null);
jest.mock("@/components/page/statistics/VolumeChart", () => () => null);
const item = {
  name: "롱소드",
  topCategory: "근거리 장비",
  subCategory: "검",
  description: "한손검",
};
const props = { params: Promise.resolve({ itemKey: encodeItemKey(item) }) };
beforeEach(() => jest.clearAllMocks());

it("keeps old retained statistics indexable and visible with empty recent periods", async () => {
  jest.mocked(getItemSeo).mockResolvedValue({
    item,
    seoEligible: true,
    lastTrade: {
      periodType: "DAILY",
      periodStart: "2020-01-01",
      periodEnd: "2020-01-01",
      minPrice: 100,
      maxPrice: 200,
      avgPrice: 999,
      totalQuantity: 2,
      totalVolume: 300,
      updatedAt: null,
    },
  } as never);
  jest.mocked(getItemStatistics).mockResolvedValue({
    dailyStatus: "empty",
    weeklyStatus: "empty",
    dailyStatistics: [],
    weeklyStatistics: [],
  });
  expect((await generateMetadata(props)).robots).toMatchObject({ index: true });
  const html = renderToStaticMarkup(await ItemPage(props));
  expect(html).toContain("2020-01-01");
  expect(html).toContain("150");
  expect(html).toContain("BreadcrumbList");
});

it("uses noindex only for an existing content-ineligible item", async () => {
  jest
    .mocked(getItemSeo)
    .mockResolvedValue({ item, seoEligible: false, lastTrade: null } as never);
  expect((await generateMetadata(props)).robots).toMatchObject({
    index: false,
    follow: true,
  });
});

it("rejects missing items and propagates temporary errors in metadata and page", async () => {
  jest.mocked(getItemSeo).mockResolvedValue(null);
  await expect(generateMetadata(props)).rejects.toThrow("404");
  await expect(ItemPage(props)).rejects.toThrow("404");
  jest.mocked(getItemSeo).mockRejectedValue(new Error("upstream unavailable"));
  await expect(generateMetadata(props)).rejects.toThrow("upstream unavailable");
  await expect(ItemPage(props)).rejects.toThrow("upstream unavailable");
});

it("redirects alternative valid keys to stored catalogue identity", async () => {
  jest
    .mocked(getItemSeo)
    .mockResolvedValue({ item, seoEligible: true, lastTrade: null } as never);
  const alternative = {
    params: Promise.resolve({
      itemKey: Buffer.from(
        JSON.stringify(
          [item.topCategory, item.subCategory, item.name],
          null,
          2,
        ),
      ).toString("base64url"),
    }),
  };
  await expect(generateMetadata(alternative)).rejects.toThrow(
    `308:${itemPath(item)}`,
  );
  await expect(ItemPage(alternative)).rejects.toThrow(`308:${itemPath(item)}`);
});
