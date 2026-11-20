import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import HeroAdministration from "@/app/(main)/admin/hero/page";
import { useAuth } from "@/contexts/AuthContext";
import { heroRequest } from "@/lib/hero/request";
import type { AdminHeroCreative, HeroSlide } from "@/types/hero";

jest.mock("@/contexts/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("@/lib/hero/request", () => ({ heroRequest: jest.fn() }));
jest.mock("@/lib/hero/validation", () => ({
  ...jest.requireActual("@/lib/hero/validation"),
  validateHeroImage: jest.fn().mockResolvedValue(undefined),
}));
const auth = jest.mocked(useAuth);
const request = jest.mocked(heroRequest);
const slide: HeroSlide = {
  id: 1,
  imageUrl: "/home-hero-auction.jpg",
  altText: "경매 안내",
  linkUrl: "https://www.memonogi.com/hero-auctions",
  position: 1,
  advertisement: false,
  startsAt: null,
  endsAt: null,
  visible: true,
};
const creative: AdminHeroCreative = {
  id: 8,
  imageUrl: "/home-hero-auction.jpg",
  altText: "길드 광고",
  linkUrl: "https://www.memonogi.com/guilds",
  blocked: false,
  createdAt: "2026-11-20T00:00:00Z",
  userId: 7,
  nickname: "에린회원",
  blockReason: null,
  leadingBidCount: 1,
  scheduledPlacementCount: 0,
  activePlacementCount: 0,
};
let defaults: HeroSlide[];
let materials: AdminHeroCreative[];

function mount() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  client.setQueryData(["hero", "public"], { items: [slide] });
  return {
    client,
    ...render(
      <QueryClientProvider client={client}>
        <HeroAdministration />
      </QueryClientProvider>,
    ),
  };
}

beforeEach(() => {
  defaults = [
    { ...slide },
    { ...slide, id: 2, position: 2, altText: "두 번째 이미지" },
  ];
  materials = [{ ...creative }];
  auth.mockReturnValue({
    user: {
      userId: 7,
      nickname: "관리자",
      email: "admin@example.test",
      profileImageUrl: null,
      role: "ADMIN",
      mainChannel: null,
      guildName: null,
      race: null,
      arcana: null,
      preferredColors: [],
      mbti: null,
      bio: null,
    },
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    refreshUser: jest.fn(),
  });
  URL.createObjectURL = jest.fn().mockReturnValue("blob:synthetic-image");
  URL.revokeObjectURL = jest.fn();
  request.mockReset();
  request.mockImplementation(async (path, method, payload) => {
    if (!method || method === "GET") {
      if (path === "admin/hero/slides")
        return defaults.map((item) => ({ ...item }));
      if (path === "admin/hero/auctions")
        return {
          auctions: [],
          enabled: true,
          serverTime: "2026-11-20T00:00:00Z",
        };
      if (path.startsWith("admin/hero/creatives/search?")) {
        const parameters = new URL(`https://example.test/${path}`).searchParams;
        const page = Number(parameters.get("page"));
        const status = parameters.get("status");
        const query = parameters.get("query") || "";
        const filtered = materials.filter(
          (item) =>
            (status === "ALL" || item.blocked === (status === "BLOCKED")) &&
            item.altText.includes(query),
        );
        return {
          items: filtered
            .slice(page * 20, (page + 1) * 20)
            .map((item) => ({ ...item })),
          page,
          size: 20,
          totalElements: filtered.length,
          totalPages: Math.ceil(filtered.length / 20),
        };
      }
      return {
        items: defaults.filter((item) => item.visible),
        serverTime: "2026-11-20T00:00:00Z",
        nextChangeAt: null,
      };
    }
    const visibility = /^admin\/hero\/slides\/(\d+)\/visibility$/.exec(path);
    if (visibility)
      defaults = defaults.map((item) =>
        item.id === Number(visibility[1])
          ? { ...item, visible: (payload as { visible: boolean }).visible }
          : item,
      );
    const deletion = /^admin\/hero\/slides\/(\d+)$/.exec(path);
    if (deletion && method === "DELETE")
      defaults = defaults.filter((item) => item.id !== Number(deletion[1]));
    const moderation = /^admin\/hero\/creatives\/(\d+)\/(block|unblock)$/.exec(
      path,
    );
    if (moderation)
      materials = materials.map((item) =>
        item.id === Number(moderation[1])
          ? {
              ...item,
              blocked: moderation[2] === "block",
              blockReason: (payload as { reason: string }).reason,
            }
          : item,
      );
    return null;
  });
});

it("hides/shows a default image and invalidates public hero data", async () => {
  const { client } = mount();
  const card = await screen.findByRole("article", {
    name: "기본 이미지 1: 경매 안내",
  });
  fireEvent.click(within(card).getByRole("button", { name: "숨기기" }));
  await waitFor(() =>
    expect(request).toHaveBeenCalledWith(
      "admin/hero/slides/1/visibility",
      "PUT",
      { visible: false },
    ),
  );
  expect(await within(card).findByText("숨김")).toBeInTheDocument();
  expect(client.getQueryState(["hero", "public"])?.isInvalidated).toBe(true);
  fireEvent.click(within(card).getByRole("button", { name: "노출하기" }));
  await waitFor(() =>
    expect(request).toHaveBeenCalledWith(
      "admin/hero/slides/1/visibility",
      "PUT",
      { visible: true },
    ),
  );
});

it("protects the last visible image but permits removal of a hidden default", async () => {
  defaults[1].visible = false;
  mount();
  const visible = await screen.findByRole("article", {
    name: "기본 이미지 1: 경매 안내",
  });
  expect(
    within(visible).getByRole("button", { name: "숨기기" }),
  ).toBeDisabled();
  expect(within(visible).getByRole("button", { name: "삭제" })).toBeDisabled();
  const hidden = screen.getByRole("article", {
    name: "기본 이미지 2: 두 번째 이미지",
  });
  expect(within(hidden).getByRole("button", { name: "삭제" })).toBeEnabled();
});

it("requires confirmation before deletion and supports cancellation", async () => {
  const user = userEvent.setup();
  mount();
  const card = await screen.findByRole("article", {
    name: "기본 이미지 1: 경매 안내",
  });
  const remove = within(card).getByRole("button", { name: "삭제" });
  await user.click(remove);
  expect(
    await screen.findByRole("alertdialog", {
      name: "기본 이미지를 삭제할까요?",
    }),
  ).toBeInTheDocument();
  expect(request).not.toHaveBeenCalledWith("admin/hero/slides/1", "DELETE");
  await user.click(screen.getByRole("button", { name: "돌아가기" }));
  await waitFor(() =>
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
  );
  expect(remove).toHaveFocus();
  await user.click(remove);
  await user.click(screen.getByRole("button", { name: "확인하고 처리" }));
  await waitFor(() =>
    expect(request).toHaveBeenCalledWith("admin/hero/slides/1", "DELETE"),
  );
  await waitFor(() =>
    expect(
      screen.queryByRole("article", { name: "기본 이미지 1: 경매 안내" }),
    ).not.toBeInTheDocument(),
  );
});

it("submits all default IDs when reordering, including hidden images", async () => {
  defaults[1].visible = false;
  mount();
  fireEvent.click(
    await screen.findByRole("button", { name: "두 번째 이미지 위로" }),
  );
  await waitFor(() =>
    expect(request).toHaveBeenCalledWith("admin/hero/slides/order", "PUT", {
      ids: [2, 1],
    }),
  );
});

it("saves metadata edits without replacing the image", async () => {
  mount();
  const card = await screen.findByRole("article", {
    name: "기본 이미지 1: 경매 안내",
  });
  fireEvent.click(within(card).getByRole("button", { name: "수정" }));
  fireEvent.change(
    within(card).getByRole("textbox", { name: "이미지 설명 (필수)" }),
    { target: { value: "새 설명" } },
  );
  fireEvent.click(within(card).getByRole("button", { name: "변경 저장" }));
  await waitFor(() =>
    expect(request).toHaveBeenCalledWith(
      "admin/hero/slides/1",
      "PUT",
      expect.any(FormData),
    ),
  );
  const form = request.mock.calls.find(
    ([path, method]) => path === "admin/hero/slides/1" && method === "PUT",
  )?.[2] as FormData;
  expect(form.get("altText")).toBe("새 설명");
  expect(form.has("image")).toBe(false);
});

it("registers a new image with accessible full-frame previews", async () => {
  const user = userEvent.setup();
  mount();
  fireEvent.click(await screen.findByRole("button", { name: "이미지 추가" }));
  await user.upload(
    screen.getByLabelText("이미지 (필수)"),
    new File(["synthetic"], "hero.jpg", { type: "image/jpeg" }),
  );
  fireEvent.change(
    screen.getByRole("textbox", { name: "이미지 설명 (필수)" }),
    { target: { value: "새 메인 이미지" } },
  );
  expect(screen.getAllByAltText("새 메인 이미지")).toHaveLength(2);
  expect(screen.queryByText("아이템 검색창 영역")).not.toBeInTheDocument();
  // jsdom's native required-file check ignores userEvent's synthetic FileList.
  fireEvent.submit(
    screen.getByRole("button", { name: "기본 이미지 등록" }).closest("form")!,
  );
  await waitFor(() => {
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(request).toHaveBeenCalledWith(
      "admin/hero/slides",
      "POST",
      expect.any(FormData),
    );
  });
});

it("paginates all registered images and resets the page on search and status changes", async () => {
  materials = Array.from({ length: 21 }, (_, i) => ({
    ...creative,
    id: 100 - i,
    altText: `길드 ${i}`,
  }));
  mount();
  expect(await screen.findByText("총 21개")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "다음 페이지" }));
  expect(await screen.findByText("#80 길드 20")).toBeInTheDocument();
  expect(screen.getByText("2 / 2 페이지")).toBeInTheDocument();
  fireEvent.change(
    screen.getByRole("searchbox", { name: "광고 이미지 검색" }),
    { target: { value: "길드 20" } },
  );
  fireEvent.click(screen.getByRole("button", { name: "검색" }));
  await waitFor(() =>
    expect(request).toHaveBeenCalledWith(
      "admin/hero/creatives/search?page=0&size=20&query=%EA%B8%B8%EB%93%9C+20&status=ALL",
    ),
  );
  expect(await screen.findByText("총 1개")).toBeInTheDocument();
  fireEvent.change(screen.getByRole("combobox", { name: "광고 이미지 상태" }), {
    target: { value: "BLOCKED" },
  });
  expect(
    await screen.findByText("조건에 맞는 광고 이미지가 없습니다."),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "다음 페이지" })).toBeDisabled();
});

it("shows owner and usage, then confirms unblock without promising restoration", async () => {
  materials = [
    {
      ...creative,
      blocked: true,
      blockReason: "정책 위반",
      leadingBidCount: 0,
    },
  ];
  mount();
  expect(
    await screen.findByText("등록자 에린회원 · 회원 #7"),
  ).toBeInTheDocument();
  expect(screen.getByText("차단 사유: 정책 위반")).toBeInTheDocument();
  expect(screen.getByText("노출 중 0건")).toBeInTheDocument();
  const action = screen.getByRole("button", { name: "소재 차단 해제" });
  expect(action).toBeDisabled();
  fireEvent.change(
    screen.getByRole("textbox", { name: "소재 차단 해제 사유" }),
    { target: { value: "재검토 완료" } },
  );
  fireEvent.click(action);
  const dialog = await screen.findByRole("alertdialog");
  expect(dialog).toHaveTextContent(
    "이미 중단된 입찰·광고는 복구되지 않으며 XP도 변경되지 않습니다.",
  );
  fireEvent.click(
    within(dialog).getByRole("button", { name: "확인하고 처리" }),
  );
  await waitFor(() =>
    expect(request).toHaveBeenCalledWith(
      "admin/hero/creatives/8/unblock",
      "POST",
      { reason: "재검토 완료" },
    ),
  );
  expect(
    await screen.findByText("사용 가능", { selector: "p" }),
  ).toBeInTheDocument();
});

it("keeps failed moderation open with an error and supports retry", async () => {
  const original = request.getMockImplementation()!;
  let failed = false;
  request.mockImplementation(async (path, method, payload) => {
    if (path.endsWith("/block") && !failed) {
      failed = true;
      throw new Error("처리 중 충돌이 발생했습니다.");
    }
    return original(path, method, payload);
  });
  mount();
  fireEvent.change(
    await screen.findByRole("textbox", { name: "소재 차단 사유" }),
    { target: { value: "정책 위반" } },
  );
  fireEvent.click(
    screen.getByRole("button", { name: "소재 차단·광고 중단 (환불 없음)" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "확인하고 처리" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "처리 중 충돌이 발생했습니다.",
  );
  expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "확인하고 처리" }));
  await waitFor(() =>
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
  );
});

it("does not fetch administrator data while authentication is loading", () => {
  auth.mockReturnValue({ ...auth(), isLoading: true });
  mount();
  expect(screen.getByRole("status")).toHaveTextContent("권한 확인 중");
  expect(request).not.toHaveBeenCalled();
});
