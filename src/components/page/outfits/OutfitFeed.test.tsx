import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { outfitRequest } from "@/lib/outfits/api";
import type { Outfit, OutfitViewerState } from "@/types/outfits";

import OutfitFeed from "./OutfitFeed";
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
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
jest.mock("next/image", () => ({ __esModule: true, default: () => null }));
jest.mock("./OutfitAuth", () => ({
  OutfitAuth: ({ children }: { children: React.ReactNode }) => children,
  useOutfitAuth: () => () => true,
}));
jest.mock("./OutfitActions", () => ({
  __esModule: true,
  default: ({
    outfit,
    state,
  }: {
    outfit: Outfit;
    state?: OutfitViewerState;
  }) => <span data-testid={`state-${outfit.id}`}>{String(state?.liked)}</span>,
}));
jest.mock("./OutfitFilters", () => ({ __esModule: true, default: () => null }));
it("retains personalized state for every loaded card after more than 48 results", async () => {
  jest.mocked(outfitRequest).mockImplementation(async (path = "") => {
    if (path.startsWith("/viewer-state"))
      return new URLSearchParams(path.split("?")[1])
        .get("ids")!
        .split(",")
        .map((id) => ({ outfitId: Number(id), liked: true, bookmarked: true }));
    const page = Number(new URLSearchParams(path.split("?")[1]).get("page"));
    return {
      content: Array.from({ length: 24 }, (_, i) => ({
        id: page * 24 + i + 1,
        userId: 7,
        author: { nickname: "작성자", verified: true, activityGrade: "EXPERT" },
        images: [],
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
  await waitFor(() =>
    expect(screen.getByTestId("state-1")).toHaveTextContent("true"),
  );
  expect(screen.getAllByLabelText("활동 등급: 달인")).toHaveLength(24);
  fireEvent.click(screen.getByRole("button", { name: "더 보기" }));
  await screen.findByTestId("state-48");
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "더 보기" })).not.toBeDisabled(),
  );
  fireEvent.click(screen.getByRole("button", { name: "더 보기" }));
  await screen.findByTestId("state-72");
  await waitFor(() =>
    expect(screen.getByTestId("state-72")).toHaveTextContent("true"),
  );
  expect(screen.getByTestId("state-1")).toHaveTextContent("true");
  const calls = jest
    .mocked(outfitRequest)
    .mock.calls.map(([path]) => path!)
    .filter((path) => path.startsWith("/viewer-state"));
  expect(
    calls.every(
      (path) =>
        new URLSearchParams(path.split("?")[1]).get("ids")!.split(",").length <=
        50,
    ),
  ).toBe(true);
});
