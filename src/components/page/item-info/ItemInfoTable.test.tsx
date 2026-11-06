import { fireEvent, render, screen } from "@testing-library/react";

import { ItemInfoResponse } from "@/types/item-info";

import ItemInfoTable from "./ItemInfoTable";

const item: ItemInfoResponse = {
  name: "나이트브링어 인퀴지터",
  topCategory: "마법 장비",
  subCategory: "스태프",
  description: null,
  inventoryWidth: 2,
  inventoryHeight: 4,
  inventoryMaxBundleCount: 1,
  history: "에린의 오랜 역사가 깃든 무기",
  acquisitionMethod: "매직 크래프트로 제작",
  storeSalesPrice: "10,000",
  weaponType: "스태프",
  repair: "마법 무기 수리",
  maxAlterationCount: 5,
};

it("preserves categories and expanded item details when the row is toggled", () => {
  render(<ItemInfoTable items={[item]} />);
  expect(screen.getByText("마법 장비")).toBeInTheDocument();
  expect(screen.getByText("스태프")).toBeInTheDocument();
  expect(screen.queryByText(item.history!)).not.toBeInTheDocument();

  fireEvent.click(screen.getByText(item.name));
  expect(screen.getByText(item.history!)).toBeInTheDocument();
  expect(screen.getByText(item.acquisitionMethod!)).toBeInTheDocument();
  expect(screen.getByText("2 x 4")).toBeInTheDocument();
  expect(screen.getByText("10,000")).toBeInTheDocument();

  fireEvent.click(screen.getByText(item.name));
  expect(screen.queryByText(item.history!)).not.toBeInTheDocument();
});

it("keeps the empty-result guidance", () => {
  render(<ItemInfoTable items={[]} />);
  expect(screen.getByText("검색 결과가 없습니다.")).toBeInTheDocument();
});
