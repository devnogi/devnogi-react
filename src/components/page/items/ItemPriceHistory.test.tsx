import { renderToStaticMarkup } from "react-dom/server";

import ItemPriceHistory from "./ItemPriceHistory";

jest.mock("@/components/page/statistics/PriceChart", () => () => null);
jest.mock("@/components/page/statistics/VolumeChart", () => () => null);

it("server-renders weekly-only statistics even when the daily chart is selected", () => {
  const html = renderToStaticMarkup(
    <ItemPriceHistory
      statistics={{
        dailyStatus: "empty",
        weeklyStatus: "available",
        dailyStatistics: [],
        weeklyStatistics: [
          {
            itemName: "검",
            itemTopCategory: "장비",
            itemSubCategory: "검",
            weekStart: "2026-08-03",
            weekEnd: "2026-08-09",
            minPrice: 100,
            maxPrice: 200,
            avgPrice: 150,
            totalQuantity: 2,
            totalVolume: 300,
          },
        ],
      }}
    />,
  );
  expect(html).toContain("2026-08-03 ~ 2026-08-09");
  expect(html).toContain("2개");
  expect(html).toContain("<table");
});

it("server-renders weighted prices, sold quantity, amount and the daily table", () => {
  const html = renderToStaticMarkup(
    <ItemPriceHistory
      statistics={{
        dailyStatus: "available",
        weeklyStatus: "empty",
        weeklyStatistics: [],
        dailyStatistics: [
          {
            itemName: "검",
            itemTopCategory: "장비",
            itemSubCategory: "검",
            date: "2026-11-12",
            minPrice: 100,
            maxPrice: 100,
            avgPrice: 100,
            totalQuantity: 1,
            totalVolume: 100,
          },
          {
            itemName: "검",
            itemTopCategory: "장비",
            itemSubCategory: "검",
            date: "2026-11-13",
            minPrice: 200,
            maxPrice: 200,
            avgPrice: 200,
            totalQuantity: 9,
            totalVolume: 1800,
          },
        ],
      }}
    />,
  );
  expect(html).toContain("190 골드");
  expect(html).toContain("10개");
  expect(html).toContain("1,900 골드");
  expect(html).toContain("<table");
  expect(html).toContain("2026-11-12");
  expect(html).not.toContain("10건");
});
