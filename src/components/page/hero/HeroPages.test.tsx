import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import HeroAdministration from "@/app/(main)/admin/hero/page";
import HeroAuctionsPage from "@/app/(main)/hero-auctions/page";
import { useAuth } from "@/contexts/AuthContext";
import { useExperience } from "@/hooks/useExperience";
import { heroRequest } from "@/lib/hero/request";
import { experienceSummaryFixture } from "@/mocks/data/experience";

jest.mock("@/contexts/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("@/hooks/useExperience", () => ({ useExperience: jest.fn() }));
jest.mock("@/lib/hero/request", () => ({ heroRequest: jest.fn() }));

const request = jest.mocked(heroRequest);
const auth = jest.mocked(useAuth);
const experience = jest.mocked(useExperience);
const slide = {
  id: 1,
  imageUrl: "/home-hero-library-v2.png",
  altText: "기본 이미지",
  linkUrl: null,
  position: 1,
  advertisement: false,
  startsAt: null,
  endsAt: null,
};
const creative = {
  id: 8,
  imageUrl: "/home-hero-library-v2.png",
  altText: "내 광고",
  linkUrl: null,
  blocked: false,
  createdAt: "2026-11-12T00:00:00Z",
};
const auction = {
  id: 10,
  weekStart: "2026-11-09",
  slot: 1,
  status: "OPEN",
  opensAt: "2026-11-09T00:00:00Z",
  closesAt: "2026-11-15T13:00:00Z",
  displayStartsAt: "2026-11-15T15:00:00Z",
  displayEndsAt: "2026-11-22T15:00:00Z",
  highestBid: 0,
  highestBidderId: null,
  winningBidId: null,
  reason: null,
};
function mount(page: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{page}</QueryClientProvider>,
  );
}
beforeEach(() => {
  auth.mockReturnValue({
    user: {
      mainChannel: null,
      guildName: null,
      race: null,
      arcana: null,
      preferredColors: [],
      mbti: null,
      bio: null,
      userId: 7,
      nickname: "회원",
      email: "member@example.test",
      profileImageUrl: null,
      role: "ADMIN",
    },
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    refreshUser: jest.fn().mockResolvedValue(undefined),
  });
  experience.mockReturnValue({
    data: {
      ...experienceSummaryFixture,
      currentXp: 70,
      availableXp: 70,
      reservedXp: 0,
    },
    isPending: false,
    isError: false,
  } as ReturnType<typeof useExperience>);
  request.mockReset();
  request.mockImplementation(async (path, method) => {
    if (method && method !== "GET") return null;
    if (path === "admin/hero/slides") return [slide];
    if (path.includes("auctions") && !path.startsWith("user/"))
      return {
        auctions: [auction, { ...auction, id: 11, slot: 2 }],
        enabled: true,
        serverTime: "2026-11-12T00:00:00Z",
      };
    if (path.endsWith("creatives")) return [creative];
    if (path === "user/hero/auctions") return { bids: [], charges: [] };
    return {
      items: [slide],
      nextChangeAt: null,
      serverTime: "2026-11-12T00:00:00Z",
    };
  });
});

it("requires a selected creative and submits an idempotent bid without trusting role for grade", async () => {
  mount(<HeroAuctionsPage />);
  const input = await screen.findByRole("spinbutton", {
    name: "1번 입찰액 (XP)",
  });
  fireEvent.change(input, { target: { value: "10" } });
  expect(screen.getByRole("button", { name: "1번 입찰하기" })).toBeDisabled();
  fireEvent.click(await screen.findByRole("radio", { name: "내 광고" }));
  fireEvent.click(screen.getByRole("button", { name: "1번 입찰하기" }));
  await waitFor(() =>
    expect(request).toHaveBeenCalledWith(
      "user/hero/auctions/10/bids",
      "POST",
      expect.objectContaining({
        creativeId: 8,
        amount: 10,
        idempotencyKey: expect.any(String),
      }),
    ),
  );
});

it("disables bidding below SENIOR even for an admin", async () => {
  experience.mockReturnValue({
    data: {
      ...experienceSummaryFixture,
      currentXp: 44,
      availableXp: 44,
      reservedXp: 0,
    },
    isPending: false,
    isError: false,
  } as ReturnType<typeof useExperience>);
  mount(<HeroAuctionsPage />);
  fireEvent.click(await screen.findByRole("radio", { name: "내 광고" }));
  fireEvent.change(
    screen.getByRole("spinbutton", { name: "1번 입찰액 (XP)" }),
    { target: { value: "10" } },
  );
  expect(screen.getByRole("button", { name: "1번 입찰하기" })).toBeDisabled();
  expect(screen.getByText(/캐릭터 인증을 완료한 수석/)).toBeInTheDocument();
});

it("protects the final default image and sends required moderation reason", async () => {
  mount(<HeroAdministration />);
  expect(await screen.findByRole("button", { name: "삭제" })).toBeDisabled();
  const block = await screen.findByRole("button", {
    name: "소재 차단·광고 중단 (환불 없음)",
  });
  expect(block).toBeDisabled();
  fireEvent.change(screen.getByRole("textbox", { name: "소재 차단 사유" }), {
    target: { value: "운영 정책 위반" },
  });
  fireEvent.click(block);
  await waitFor(() =>
    expect(request).toHaveBeenCalledWith(
      "admin/hero/creatives/8/block",
      "POST",
      { reason: "운영 정책 위반" },
    ),
  );
});

it("does not request administrator data for an ordinary member", () => {
  auth.mockReturnValue({
    ...auth(),
    user: {
      mainChannel: null,
      guildName: null,
      race: null,
      arcana: null,
      preferredColors: [],
      mbti: null,
      bio: null,
      userId: 7,
      nickname: "회원",
      email: "member@example.test",
      profileImageUrl: null,
      role: "USER",
    },
  });
  mount(<HeroAdministration />);
  expect(screen.getByRole("alert")).toHaveTextContent("관리자 계정");
  expect(request).not.toHaveBeenCalled();
});
