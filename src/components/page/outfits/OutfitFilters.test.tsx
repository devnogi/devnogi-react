import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useState } from "react";

import type { OutfitItem } from "@/types/outfits";

import OutfitFilters from "./OutfitFilters";

jest.mock("./ItemPicker", () => ({
  __esModule: true,
  default: ({
    slot,
    onChange,
  }: {
    slot: OutfitItem["slot"];
    onChange: (item?: OutfitItem) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onChange({
          slot,
          inputType: slot === "MOTION" ? "CUSTOM" : "CATALOG",
          name: slot === "MOTION" ? "춤" : slot + " 아이템",
          topCategory: slot === "MOTION" ? undefined : "분류",
          subCategory: slot === "MOTION" ? undefined : "하위",
        })
      }
    >
      {slot} 선택
    </button>
  ),
}));

const applied = jest.fn();
function Harness({ initial = "" }: { initial?: string }) {
  const [search, setSearch] = useState(initial);
  return (
    <OutfitFilters
      search={search}
      onApply={(params) => {
        applied(params.toString());
        setSearch(params.toString());
      }}
    />
  );
}
beforeEach(() => applied.mockClear());

it("shows the ordered chips and independently toggles both genders", () => {
  render(<Harness />);
  const bar = screen.getByLabelText("의장 필터");
  expect(
    within(bar)
      .getAllByRole("button")
      .map((button) => button.textContent),
  ).toEqual([
    "남",
    "여",
    "머리",
    "액세서리",
    "얼굴장식",
    "의상",
    "꼬리",
    "장갑",
    "신발",
    "무기",
    "로브",
    "모션",
  ]);
  expect(within(bar).getAllByRole("button", { expanded: false })).toHaveLength(
    10,
  );
  fireEvent.click(within(bar).getByRole("button", { name: "남" }));
  expect(applied).toHaveBeenLastCalledWith("gender=MALE");
  fireEvent.click(within(bar).getByRole("button", { name: "여" }));
  expect(applied).toHaveBeenLastCalledWith("gender=MALE&gender=FEMALE");
  fireEvent.click(within(bar).getByRole("button", { name: "남" }));
  expect(applied).toHaveBeenLastCalledWith("gender=FEMALE");
  fireEvent.click(within(bar).getByRole("button", { name: "여" }));
  expect(applied).toHaveBeenLastCalledWith("");
});

it("applies two accessory choices together and discards cancelled edits", async () => {
  render(<Harness initial="tags=%EA%B2%A8%EC%9A%B8" />);
  const trigger = screen.getByRole("button", { name: "액세서리" });
  trigger.focus();
  fireEvent.click(trigger);
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "ACCESSORY_1 선택" }));
  fireEvent.click(screen.getByRole("button", { name: "ACCESSORY_2 선택" }));
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(applied).not.toHaveBeenCalled();
  await waitFor(() => expect(trigger).toHaveFocus());
  fireEvent.click(screen.getByRole("button", { name: "액세서리" }));
  fireEvent.click(screen.getByRole("button", { name: "ACCESSORY_1 선택" }));
  fireEvent.click(screen.getByRole("button", { name: "ACCESSORY_2 선택" }));
  fireEvent.click(screen.getByRole("button", { name: "의장 보기" }));
  const query = new URLSearchParams(applied.mock.lastCall?.[0]);
  expect(query.getAll("tags")).toEqual(["겨울"]);
  expect(JSON.parse(query.get("items") ?? "[]")).toMatchObject([
    { slot: "ACCESSORY_1" },
    { slot: "ACCESSORY_2" },
  ]);
  fireEvent.click(
    screen.getByRole("button", {
      name: "액세서리 1 ACCESSORY_1 아이템 조건 해제",
    }),
  );
  const cleared = new URLSearchParams(applied.mock.lastCall?.[0]);
  expect(JSON.parse(cleared.get("items") ?? "[]")).toMatchObject([
    { slot: "ACCESSORY_2" },
  ]);
});

it("keeps legacy tag and motion links visible and clearable", () => {
  render(<Harness initial="tags=%EA%B2%A8%EC%9A%B8&motion=%EC%B6%A4" />);
  expect(
    screen.getByRole("button", { name: "태그 겨울 조건 해제" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "모션 춤 조건 해제" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "모션" }));
  fireEvent.click(screen.getByRole("button", { name: "MOTION 선택" }));
  fireEvent.click(screen.getByRole("button", { name: "의장 보기" }));
  const query = new URLSearchParams(applied.mock.lastCall?.[0]);
  expect(query.has("motion")).toBe(false);
  expect(query.getAll("tags")).toEqual(["겨울"]);
  expect(JSON.parse(query.get("items") ?? "[]")).toMatchObject([
    { slot: "MOTION" },
  ]);
  fireEvent.click(screen.getByRole("button", { name: "전체 초기화" }));
  expect(applied).toHaveBeenLastCalledWith("");
});
