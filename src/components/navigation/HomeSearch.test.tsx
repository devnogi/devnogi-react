import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { HomeSearch, HomeSearchProvider } from "./HomeSearch";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("@/hooks/useItemInfos", () => ({
  useItemInfos: () => ({
    data: [
      { name: "빛나는 검", topCategory: "무기", subCategory: "검" },
      { name: "빛나는 방패", topCategory: "방어구", subCategory: "방패" },
      ...Array.from({ length: 10 }, (_, index) => ({
        name: `목록 아이템 ${index + 1}`,
        topCategory: "무기",
        subCategory: "검",
      })),
    ],
    isLoading: false,
  }),
}));

function setup() {
  render(
    <HomeSearchProvider>
      <HomeSearch location="navigation" />
      <HomeSearch location="hero" />
    </HomeSearchProvider>,
  );
  return {
    nav: screen.getByRole("combobox", { name: "상단 아이템 검색" }),
    hero: screen.getByRole("combobox", { name: "메인 아이템 검색" }),
  };
}

beforeEach(() => {
  push.mockClear();
  localStorage.clear();
});

it("두 입력을 동기화하고 자동완성 키보드 선택으로 카테고리와 함께 이동한다", () => {
  const { nav, hero } = setup();
  fireEvent.focus(hero);
  fireEvent.change(hero, { target: { value: "빛나는" } });
  expect(nav).toHaveValue("빛나는");
  expect(
    screen.getByRole("listbox", { name: "아이템 자동완성" }),
  ).toBeInTheDocument();
  fireEvent.keyDown(hero, { key: "ArrowDown" });
  expect(screen.getAllByRole("option")[0]).toHaveAttribute(
    "aria-selected",
    "true",
  );
  fireEvent.keyDown(hero, { key: "ArrowDown" });
  fireEvent.keyDown(hero, { key: "ArrowUp" });
  fireEvent.submit(hero.closest("form")!);
  expect(push).toHaveBeenCalledWith(
    `/auction-history?${new URLSearchParams({ item_name: "빛나는 검", top_category: "무기", sub_category: "검" })}`,
  );
});

it("Enter 제출과 검색 버튼이 정확히 일치하는 아이템을 같은 방식으로 검색한다", async () => {
  const user = userEvent.setup();
  const { nav, hero } = setup();
  await user.type(hero, "빛나는 검{Enter}");
  const expected = `/auction-history?${new URLSearchParams({ item_name: "빛나는 검", top_category: "무기", sub_category: "검" })}`;
  expect(push).toHaveBeenLastCalledWith(expected);
  await user.click(
    screen.getByRole("button", { name: "상단 아이템 검색 실행" }),
  );
  expect(push).toHaveBeenLastCalledWith(expected);
  expect(nav).toHaveValue("빛나는 검");
});

it("포커스를 옮기면 현재 입력에만 자동완성 목록을 표시한다", () => {
  const { nav, hero } = setup();
  fireEvent.focus(nav);
  fireEvent.change(nav, { target: { value: "빛나는" } });
  fireEvent.focus(hero);
  expect(screen.getAllByRole("listbox")).toHaveLength(1);
  expect(hero).toHaveAttribute("aria-expanded", "true");
  expect(nav).toHaveAttribute("aria-expanded", "false");
});

it("키보드로 긴 자동완성 목록을 이동하면 선택 항목을 보이게 하고 Enter로 검색한다", async () => {
  const scrollIntoView = jest.fn();
  const original = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "scrollIntoView",
  );
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: scrollIntoView,
  });
  try {
    const user = userEvent.setup();
    const { hero } = setup();
    await user.type(hero, "목록 아이템");
    await user.keyboard("{ArrowDown>10/}");
    const options = screen.getAllByRole("option");
    expect(options[9]).toHaveAttribute("aria-selected", "true");
    expect(scrollIntoView).toHaveBeenLastCalledWith({ block: "nearest" });
    expect(scrollIntoView.mock.instances.at(-1)).toBe(options[9]);
    await user.keyboard("{Enter}");
    expect(push).toHaveBeenCalledWith(
      `/auction-history?${new URLSearchParams({ item_name: "목록 아이템 10", top_category: "무기", sub_category: "검" })}`,
    );
  } finally {
    if (original)
      Object.defineProperty(HTMLElement.prototype, "scrollIntoView", original);
    else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
  }
});

it("일반 검색어를 저장하고 공백 제출은 무시하며 지우기와 Escape가 동작한다", () => {
  const { nav, hero } = setup();
  fireEvent.focus(nav);
  fireEvent.change(nav, { target: { value: "  없는 & 아이템  " } });
  expect(nav).toHaveAttribute("type", "search");
  expect(hero).toHaveAttribute("type", "search");
  expect(
    screen.getByRole("button", { name: "메인 아이템 검색 입력 지우기" }),
  ).toBeInTheDocument();
  expect(hero).toHaveValue("  없는 & 아이템  ");
  fireEvent.keyDown(nav, { key: "Escape" });
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  fireEvent.submit(nav.closest("form")!);
  expect(push).toHaveBeenCalledWith(
    `/auction-history?${new URLSearchParams({ item_name: "없는 & 아이템" })}`,
  );
  expect(
    JSON.parse(localStorage.getItem("auction_recent_searches")!)[0].itemName,
  ).toBe("없는 & 아이템");
  fireEvent.click(
    screen.getByRole("button", { name: "상단 아이템 검색 입력 지우기" }),
  );
  expect(hero).toHaveValue("");
  fireEvent.submit(nav.closest("form")!);
  expect(push).toHaveBeenCalledTimes(1);
});

it.each([
  [
    { itemName: "최근 검", topCategory: "무기", subCategory: "검" },
    { item_name: "최근 검", top_category: "무기", sub_category: "검" },
  ],
  [{ itemName: "일반 검색" }, { item_name: "일반 검색" }],
])("최근 검색 %s을 선택해 기존 저장 형식대로 이동한다", (recent, expected) => {
  localStorage.setItem("auction_recent_searches", JSON.stringify([recent]));
  const { hero } = setup();
  fireEvent.focus(hero);
  const list = screen.getByRole("listbox", { name: "최근 검색어" });
  fireEvent.click(within(list).getByRole("option"));
  expect(push).toHaveBeenCalledWith(
    `/auction-history?${new URLSearchParams(expected)}`,
  );
});
