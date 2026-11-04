import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";

import { useUnifiedSearch } from "@/hooks/useUnifiedSearch";
import { UnifiedSearchItem } from "@/types/unified-search";

import { HomeSearch, HomeSearchProvider } from "./HomeSearch";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("sonner", () => ({ toast: { info: jest.fn() } }));
jest.mock("@/hooks/useUnifiedSearch", () => ({
  useUnifiedSearch: jest.fn(),
}));

const candidates: UnifiedSearchItem[] = [
  { type: "MENU", label: "경매장", targetKey: "AUCTION" },
  { type: "MENU", label: "도감", targetKey: "CODEX" },
  { type: "ITEM", label: "빛나는 검", targetKey: "빛나는 검" },
  {
    type: "USER",
    label: "빛나는사람",
    targetKey: "42",
    userId: 42,
    serverName: "류트",
  },
];

function setup() {
  render(
    <HomeSearchProvider>
      <HomeSearch location="navigation" />
      <HomeSearch location="hero" />
    </HomeSearchProvider>,
  );
  return {
    nav: screen.getByRole("combobox", { name: "상단 통합 검색" }),
    hero: screen.getByRole("combobox", { name: "메인 통합 검색" }),
  };
}

beforeEach(() => {
  push.mockClear();
  jest.mocked(toast.info).mockClear();
  localStorage.clear();
  jest.mocked(useUnifiedSearch).mockImplementation(
    (query) =>
      ({
        data: query.trim()
          ? candidates.filter((item) => item.label.includes(query.trim()))
          : [],
        partialFailures: [],
        isDebouncing: false,
        isLoading: false,
        isError: false,
      }) as unknown as ReturnType<typeof useUnifiedSearch>,
  );
});

it("두 입력을 동기화하고 통합 검색 안내 문구를 표시한다", () => {
  const { nav, hero } = setup();
  expect(nav).toHaveAttribute(
    "placeholder",
    "유저명, 아이템명, 메뉴를 입력하세요",
  );
  expect(hero).toHaveAttribute(
    "placeholder",
    "유저명, 아이템명, 메뉴를 입력하세요",
  );
  fireEvent.change(hero, { target: { value: "빛나는" } });
  expect(nav).toHaveValue("빛나는");
});

it("후보를 선택하지 않은 Enter는 첫 번째 후보를 실행한다", async () => {
  const user = userEvent.setup();
  const { hero } = setup();
  await user.type(hero, "경매장{Enter}");
  expect(push).toHaveBeenCalledWith("/auction-realtime");
});

it("검색 갱신 중 Enter는 이전 후보를 실행하지 않는다", async () => {
  jest.mocked(useUnifiedSearch).mockImplementation(
    () =>
      ({
        data: [candidates[0]],
        partialFailures: [],
        isDebouncing: true,
        isLoading: false,
        isError: false,
      }) as unknown as ReturnType<typeof useUnifiedSearch>,
  );
  const user = userEvent.setup();
  const { hero } = setup();
  await user.type(hero, "경");
  const status = screen.getByRole("status");
  expect(status).toHaveAttribute("aria-live", "polite");
  expect(status).toHaveTextContent("로딩 중...");
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  expect(hero).toHaveAttribute("aria-expanded", "false");
  expect(hero).not.toHaveAttribute("aria-controls");
  await user.keyboard("{Enter}");
  expect(push).not.toHaveBeenCalled();
});

it("검색 결과가 없으면 스크린리더 상태 메시지를 제공한다", async () => {
  const user = userEvent.setup();
  const { hero } = setup();
  await user.type(hero, "없는 결과");
  const status = screen.getByRole("status");
  expect(status).toHaveAttribute("aria-live", "polite");
  expect(status).toHaveTextContent("검색 결과가 없습니다");
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
});

it("검색 오류는 listbox 밖 상태 메시지로 표시한다", async () => {
  jest.mocked(useUnifiedSearch).mockImplementation(
    () =>
      ({
        data: [],
        partialFailures: [],
        isDebouncing: false,
        isLoading: false,
        isError: true,
      }) as unknown as ReturnType<typeof useUnifiedSearch>,
  );
  const user = userEvent.setup();
  const { hero } = setup();
  await user.type(hero, "오류");
  expect(screen.getByRole("status")).toHaveTextContent(
    "검색 결과를 불러오지 못했습니다",
  );
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
});

it("아이템을 선택하면 실시간 경매장으로 이동한다", async () => {
  const user = userEvent.setup();
  const { hero } = setup();
  await user.type(hero, "빛나는 검");
  expect(
    screen.getByRole("listbox", { name: "통합 검색 자동완성" }),
  ).toBeInTheDocument();
  await user.keyboard("{ArrowDown}{Enter}");
  expect(push).toHaveBeenCalledWith(
    `/auction-realtime?${new URLSearchParams({ item_name: "빛나는 검" })}`,
  );
});

it("사용자 선택은 서버명을 표시하고 준비 중 안내를 보여 준다", async () => {
  const user = userEvent.setup();
  const { hero } = setup();
  await user.type(hero, "빛나는사람");
  expect(screen.getByText("류트 서버")).toBeInTheDocument();
  await user.click(screen.getByRole("option"));
  expect(toast.info).toHaveBeenCalledWith("사용자 프로필은 준비 중입니다.");
  expect(push).not.toHaveBeenCalled();
});

it("경매장과 도감 상위 메뉴를 합의한 화면으로 이동한다", async () => {
  const user = userEvent.setup();
  const { hero } = setup();
  await user.type(hero, "도감");
  await user.click(screen.getByRole("option"));
  expect(push).toHaveBeenLastCalledWith("/item-info");
});

it("기존 아이템 최근 검색을 읽어 실시간 경매장으로 이동한다", async () => {
  localStorage.setItem(
    "auction_recent_searches",
    JSON.stringify([{ itemName: "최근 검", topCategory: "무기" }]),
  );
  const { hero } = setup();
  fireEvent.focus(hero);
  const list = await screen.findByRole("listbox", { name: "최근 검색어" });
  fireEvent.click(within(list).getByRole("option"));
  expect(push).toHaveBeenCalledWith(
    `/auction-realtime?${new URLSearchParams({ item_name: "최근 검" })}`,
  );
});

it("한 서비스가 실패하면 부분 결과 안내를 표시한다", () => {
  jest.mocked(useUnifiedSearch).mockImplementation(
    (query) =>
      ({
        data: query.trim() ? [candidates[2]] : [],
        partialFailures: ["AUTH"],
        isDebouncing: false,
        isLoading: false,
        isError: false,
      }) as unknown as ReturnType<typeof useUnifiedSearch>,
  );
  const { hero } = setup();
  fireEvent.focus(hero);
  fireEvent.change(hero, { target: { value: "검" } });
  const listbox = screen.getByRole("listbox");
  const status = screen.getByRole("status");
  expect(status).toHaveTextContent("일부 검색 결과를 불러오지 못했습니다.");
  expect(listbox).not.toContainElement(status);
  expect(listbox.parentElement).toBe(status.parentElement);
});
