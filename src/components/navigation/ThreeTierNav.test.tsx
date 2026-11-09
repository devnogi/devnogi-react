import { fireEvent, render, screen, within } from "@testing-library/react";

import ThreeTierNav from "./ThreeTierNav";

let pathname = "/";
const toggleTheme = jest.fn();
let mockAuthState: {
  isAuthenticated: boolean;
  user: {
    nickname: string;
    role: string;
    verified: boolean;
  } | null;
} = { isAuthenticated: false, user: null };

jest.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockAuthState,
}));
jest.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => ({ isDarkMode: false, toggleTheme }),
}));

beforeEach(() => {
  pathname = "/";
  mockAuthState = { isAuthenticated: false, user: null };
  toggleTheme.mockClear();
});

it("주요 메뉴를 요청된 순서로 제공하고 검색폼은 노출하지 않는다", () => {
  render(<ThreeTierNav />);

  const navigation = screen.getByRole("navigation", { name: "주요 메뉴" });
  expect(
    within(navigation).getByRole("link", { name: "메인" }),
  ).toHaveAttribute("href", "/");
  expect(
    within(navigation).getByRole("link", { name: "커뮤니티" }),
  ).toHaveAttribute("href", "/community");
  expect(
    within(navigation).getByRole("button", { name: "경매장" }),
  ).toBeInTheDocument();
  expect(
    within(navigation).getByRole("link", { name: "뿔피리" }),
  ).toHaveAttribute("href", "/horn-bugle");
  expect(
    within(navigation).getByRole("button", { name: "도감" }),
  ).toBeInTheDocument();
  expect(screen.queryByRole("search")).not.toBeInTheDocument();
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
});

it("경매장과 도감 드롭다운 링크를 제공한다", () => {
  render(<ThreeTierNav />);

  fireEvent.click(screen.getByRole("button", { name: "경매장" }));

  const auctionMenu = screen.getByRole("group", { name: "경매장 메뉴" });
  expect(
    within(auctionMenu).getByRole("link", { name: "거래 내역" }),
  ).toHaveAttribute("href", "/auction-history");
  expect(
    within(auctionMenu).getByRole("link", { name: "실시간 거래" }),
  ).toHaveAttribute("href", "/auction-realtime");
  expect(
    within(auctionMenu).getByRole("link", { name: "시세 정보" }),
  ).toHaveAttribute("href", "/statistics");

  fireEvent.click(screen.getByRole("button", { name: "도감" }));
  const encyclopediaMenu = screen.getByRole("group", { name: "도감 메뉴" });
  expect(
    within(encyclopediaMenu).getByRole("link", { name: "아이템 도감" }),
  ).toHaveAttribute("href", "/item-info");
});

it("테마 전환과 로그인 진입점을 오른쪽에 제공한다", () => {
  render(<ThreeTierNav />);

  fireEvent.click(screen.getByRole("button", { name: "다크 모드로 전환" }));
  expect(toggleTheme).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute(
    "href",
    "/sign-in",
  );
});

it.each(["ADMIN", "SUPER_ADMIN"])(
  "%s 로그인 사용자에게 관리자 버튼을 제공한다",
  (role) => {
    mockAuthState = {
      isAuthenticated: true,
      user: { nickname: "관리자", role, verified: false },
    };

    render(<ThreeTierNav />);

    expect(screen.getByRole("link", { name: "관리자" })).toHaveAttribute(
      "href",
      "/admin",
    );
  },
);

it("일반 로그인 사용자에게 관리자 버튼을 노출하지 않는다", () => {
  mockAuthState = {
    isAuthenticated: true,
    user: { nickname: "사용자", role: "USER", verified: false },
  };

  render(<ThreeTierNav />);

  expect(
    screen.queryByRole("link", { name: "관리자" }),
  ).not.toBeInTheDocument();
});

it("하위 경로에서도 상위 드롭다운 메뉴를 활성 상태로 표시한다", () => {
  pathname = "/auction-realtime";
  render(<ThreeTierNav />);
  fireEvent.click(screen.getByRole("button", { name: "경매장" }));

  expect(screen.getByRole("link", { name: "실시간 거래" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

it("드롭다운을 열고 Escape로 닫으면 트리거로 포커스를 돌린다", () => {
  render(<ThreeTierNav />);
  const trigger = screen.getByRole("button", { name: "경매장" });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  const link = screen.getByRole("link", { name: "시세 정보" });
  link.focus();
  fireEvent.keyDown(link, { key: "Escape" });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(trigger).toHaveFocus();
  expect(
    screen.queryByRole("group", { name: "경매장 메뉴" }),
  ).not.toBeInTheDocument();
});

it("바깥 영역을 누르면 드롭다운을 닫는다", () => {
  render(<ThreeTierNav />);
  const trigger = screen.getByRole("button", { name: "경매장" });
  fireEvent.click(trigger);
  fireEvent.pointerDown(document.body);
  expect(trigger).toHaveAttribute("aria-expanded", "false");
});

it("의장 메뉴를 커뮤니티와 경매장 사이에 표시하고 하위 경로를 활성화한다", () => {
  pathname = "/outfits/123";
  render(<ThreeTierNav />);
  const nav = screen.getByRole("navigation", { name: "주요 메뉴" });
  const link = within(nav).getByRole("link", { name: "의장" });
  expect(link).toHaveAttribute("href", "/outfits");
  expect(link).toHaveAttribute("aria-current", "page");
  expect(nav.textContent).toMatch(/커뮤니티길드의장경매장/);
  expect(within(nav).getByRole("link", { name: "길드" })).toHaveAttribute(
    "href",
    "/guilds",
  );
});
