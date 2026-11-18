import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { outfitRequest } from "@/lib/outfits/api";
import type { Outfit } from "@/types/outfits";

import OutfitFeed from "./OutfitFeed";
const mockPush = jest.fn();
const mockSearch = new URLSearchParams();
jest.mock("@/lib/outfits/api", () => ({ outfitRequest: jest.fn() }));
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { userId: 7 },
    isAuthenticated: true,
    isLoading: false,
  }),
}));
jest.mock("next/navigation", () => ({
  usePathname: () => "/outfits",
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearch,
}));
jest.mock("next/image", () => ({ __esModule: true, default: () => null }));
jest.mock("./OutfitAuth", () => ({
  OutfitAuth: ({ children }: { children: React.ReactNode }) => children,
  useOutfitAuth: () => () => true,
}));
jest.mock("./OutfitActions", () => ({
  __esModule: true,
  default: ({ outfit }: { outfit: Outfit }) => (
    <span data-testid={"actions-" + outfit.id} />
  ),
}));
jest.mock("./OutfitFilters", () => ({
  __esModule: true,
  default: ({ onApply }: { onApply: (params: URLSearchParams) => void }) => (
    <button
      onClick={() =>
        onApply(
          new URLSearchParams(
            "tags=%EA%B2%A8%EC%9A%B8&gender=MALE&cursor=stale&sort=LATEST",
          ),
        )
      }
    >
      필터 적용
    </button>
  ),
}));
beforeEach(() => {
  mockPush.mockClear();
  for (const key of new Set(mockSearch.keys())) mockSearch.delete(key);
  jest.mocked(outfitRequest).mockReset();
});
it("keeps the filter trigger mounted when the URL filter changes", () => {
  jest.mocked(outfitRequest).mockResolvedValue({
    content: [],
    hasNext: false,
    nextCursor: null,
  });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const { rerender } = render(
    <QueryClientProvider client={client}>
      <OutfitFeed />
    </QueryClientProvider>,
  );
  const trigger = screen.getByRole("button", { name: "필터 적용" });
  mockSearch.set("gender", "MALE");
  rerender(
    <QueryClientProvider client={client}>
      <OutfitFeed />
    </QueryClientProvider>,
  );
  expect(screen.getByRole("button", { name: "필터 적용" })).toBe(trigger);
});
it("keeps list actions hidden without viewer-state requests across pages", async () => {
  jest.mocked(outfitRequest).mockImplementation(async (path = "") => {
    if (path.startsWith("/viewer-state"))
      throw new Error("The feed must not request viewer state");
    const page = Number(new URLSearchParams(path.split("?")[1]).get("page"));
    return {
      content: Array.from({ length: 24 }, (_, i) => ({
        id: page * 24 + i + 1,
        userId: 7,
        author: { nickname: "작성자", verified: true, activityGrade: "EXPERT" },
        images: [],
        items: [],
        content: "의장 이야기",
        likeCount: 1,
        commentCount: 0,
      })),
      hasNext: page < 2,
      nextCursor: String(page + 1),
    };
  });
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <OutfitFeed />
    </QueryClientProvider>,
  );
  await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(24));
  expect(screen.queryByTestId("actions-1")).not.toBeInTheDocument();
  expect(screen.queryByText("마비노기 의장·코디 모음")).not.toBeInTheDocument();
  expect(
    screen.queryByText("에린에서 만나는 나만의 스타일"),
  ).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "최신순" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "인기순" })).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "의장 올리기" }),
  ).toBeInTheDocument();
  expect(screen.getAllByLabelText("활동 등급: 달인")).toHaveLength(24);
  fireEvent.click(screen.getByRole("button", { name: "더 보기" }));
  await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(48));
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "더 보기" })).not.toBeDisabled(),
  );
  fireEvent.click(screen.getByRole("button", { name: "더 보기" }));
  await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(72));
  expect(screen.queryByTestId("actions-72")).not.toBeInTheDocument();
  expect(
    jest
      .mocked(outfitRequest)
      .mock.calls.some(([path]) => path?.startsWith("/viewer-state")),
  ).toBe(false);
});

it("preserves the sort and resets the cursor when filters change", () => {
  mockSearch.set("sort", "POPULAR");
  mockSearch.set("cursor", "previous");
  jest.mocked(outfitRequest).mockResolvedValue({
    content: [],
    hasNext: false,
    nextCursor: null,
  });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <OutfitFeed />
    </QueryClientProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "필터 적용" }));
  expect(mockPush).toHaveBeenCalledWith(
    "/outfits?sort=POPULAR&tags=%EA%B2%A8%EC%9A%B8&gender=MALE",
  );
  mockPush.mockClear();
  fireEvent.click(screen.getByRole("button", { name: "최신순" }));
  expect(mockPush).toHaveBeenCalledWith("/outfits?sort=LATEST");
});
