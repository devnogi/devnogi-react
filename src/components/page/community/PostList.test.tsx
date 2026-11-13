import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import { clientAxios } from "@/lib/api/clients";
import type { BackendPostsData } from "@/lib/community/feed";

import PostList from "./PostList";

let auth = {
  user: null as { userId: number } | null,
  isAuthenticated: false,
  isLoading: true,
};
jest.mock("@/contexts/AuthContext", () => ({ useAuth: () => auth }));
jest.mock("@/lib/api/clients", () => ({
  clientAxios: { get: jest.fn(), post: jest.fn(), request: jest.fn() },
}));
jest.mock("./PostComposer", () => ({ __esModule: true, default: () => null }));
jest.mock("./ReportDialog", () => ({ __esModule: true, default: () => null }));
const initial: BackendPostsData = {
  items: [
    {
      id: 7,
      userId: 42,
      content: "서버에서 제공한 공개 이야기",
      createdAt: "2026-11-13T00:00:00Z",
      likeCount: 2,
    },
  ],
  meta: {
    currentPage: 1,
    pageSize: 20,
    totalPages: 2,
    totalElements: 21,
    isFirst: true,
    isLast: false,
  },
};

it("preserves SSR content but prevents reactions until auth and viewer state are ready", async () => {
  global.IntersectionObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })) as unknown as typeof IntersectionObserver;
  let resolve!: (value: unknown) => void;
  jest.mocked(clientAxios.get).mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  jest.mocked(clientAxios.post).mockResolvedValue({});
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const view = () => (
    <QueryClientProvider client={client}>
      <PostList initial={initial} tab="latest" />
    </QueryClientProvider>
  );
  const rendered = render(view());
  const like = screen.getByRole("button", { name: "좋아요" });
  const bookmark = screen.getByRole("button", { name: "즐겨찾기" });
  expect(screen.getByText("서버에서 제공한 공개 이야기")).toBeVisible();
  expect(screen.getByRole("link", { name: "다음 페이지" })).toHaveAttribute(
    "href",
    "/community?page=2",
  );
  expect(like).toBeDisabled();
  fireEvent.click(like);
  fireEvent.click(bookmark);
  expect(clientAxios.post).not.toHaveBeenCalled();
  expect(clientAxios.request).not.toHaveBeenCalled();

  auth = { user: { userId: 8 }, isAuthenticated: true, isLoading: false };
  rendered.rerender(view());
  await waitFor(() => expect(clientAxios.get).toHaveBeenCalled());
  expect(like).toBeDisabled();
  fireEvent.click(like);
  fireEvent.click(bookmark);
  expect(clientAxios.post).not.toHaveBeenCalled();
  expect(clientAxios.request).not.toHaveBeenCalled();
  await act(async () =>
    resolve({
      data: {
        data: {
          ...initial,
          items: initial.items.map((item) => ({
            ...item,
            liked: true,
            bookmarked: true,
          })),
        },
      },
    }),
  );
  await waitFor(() => expect(like).toBeEnabled());
  expect(like).toHaveAttribute("aria-pressed", "true");
  expect(bookmark).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(like);
  await waitFor(() => expect(clientAxios.post).toHaveBeenCalledTimes(1));
  expect(like).toHaveAttribute("aria-pressed", "false");
});
