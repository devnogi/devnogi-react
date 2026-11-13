import { renderToStaticMarkup } from "react-dom/server";

import { getItemSeo, getPopularItems } from "@/lib/items/data";
import { itemPath } from "@/lib/items/identity";

import PopularItemLinks from "./PopularItemLinks";
jest.mock("@/lib/items/data", () => ({
  getItemSeo: jest.fn(),
  getPopularItems: jest.fn(),
}));
const item = { name: "롱소드", topCategory: "근거리 장비", subCategory: "검" };
beforeEach(() => jest.clearAllMocks());
it("renders links only for exact known catalogue entries", async () => {
  jest.mocked(getPopularItems).mockResolvedValue([
    {
      itemName: item.name,
      itemTopCategory: item.topCategory,
      itemSubCategory: item.subCategory,
    },
  ] as never);
  jest.mocked(getItemSeo).mockResolvedValue({ item } as never);
  expect(renderToStaticMarkup(await PopularItemLinks())).toContain(
    itemPath(item),
  );
  jest.mocked(getItemSeo).mockResolvedValue(null);
  expect(await PopularItemLinks()).toBeNull();
});
it("keeps successful empty rankings separate from transient failures", async () => {
  jest.mocked(getPopularItems).mockResolvedValue([]);
  expect(await PopularItemLinks()).toBeNull();
  const error = jest.spyOn(console, "error").mockImplementation(() => {});
  jest.mocked(getPopularItems).mockRejectedValue(new Error("503"));
  expect(renderToStaticMarkup(await PopularItemLinks())).toContain(
    "불러오지 못했습니다",
  );
  expect(error).toHaveBeenCalled();
  error.mockRestore();
});
