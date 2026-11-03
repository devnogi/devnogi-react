import { fireEvent, render, screen } from "@testing-library/react";

import ThreeTierNav from "./ThreeTierNav";

const push = jest.fn();
let pathname = "/";
const params = new URLSearchParams();
jest.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push }),
  useSearchParams: () => params,
}));
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: false, user: null }),
}));
jest.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => ({ isDarkMode: false, toggleTheme: jest.fn() }),
}));
jest.mock("@/hooks/useItemInfos", () => ({
  useItemInfos: () => ({
    data: [{ name: "검", topCategory: "무기", subCategory: "검" }],
    isLoading: false,
  }),
}));
jest.mock("@/components/notification/NotificationDropdown", () => () => null);

beforeEach(() => {
  push.mockClear();
  localStorage.clear();
});

it.each([
  ["/community", "게시글 제목을 검색해주세요", "/community?q=%EA%B2%80"],
  ["/horn-bugle", "캐릭터명, 메시지 검색...", "/horn-bugle?keyword=%EA%B2%80"],
  [
    "/auction-history",
    "아이템 검색",
    `/auction-history?${new URLSearchParams({ item_name: "검", top_category: "무기", sub_category: "검" })}`,
  ],
  [
    "/auction-realtime",
    "아이템 검색",
    `/auction-realtime?${new URLSearchParams({ item_name: "검", top_category: "무기", sub_category: "검" })}`,
  ],
  [
    "/item-info",
    "아이템 정보 검색",
    `/item-info?${new URLSearchParams({ item_name: "검", top_category: "무기", sub_category: "검" })}`,
  ],
  [
    "/statistics",
    "시세 아이템 검색",
    `/statistics?${new URLSearchParams({ tab: "item", item_name: "검", top_category: "무기", sub_category: "검" })}`,
  ],
])("%s의 상단 검색 동작을 보존한다", (path, placeholder, expected) => {
  pathname = path;
  render(<ThreeTierNav />);
  const input = screen.getAllByPlaceholderText(placeholder)[0];
  fireEvent.change(input, { target: { value: "검" } });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(push).toHaveBeenCalledWith(expected);
});
