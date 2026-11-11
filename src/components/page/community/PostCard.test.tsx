import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";

import {
  normalizePostSummary,
  type PostSummary,
} from "@/hooks/useInfinitePosts";
import { clientAxios } from "@/lib/api/clients";

import PostCard from "./PostCard";

jest.mock("@/lib/api/clients", () => ({
  clientAxios: {
    request: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));
type MockAuth = { user: { userId: number } | null; isAuthenticated: boolean };
const mockUseAuth = jest.fn<MockAuth, []>(() => ({
  user: null,
  isAuthenticated: false,
}));
jest.mock("@/contexts/AuthContext", () => ({ useAuth: () => mockUseAuth() }));
jest.mock("sonner", () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

const post: PostSummary = {
  id: 7,
  userId: 42,
  username: "나오",
  title: "평범한 하루",
  content: "평범한 하루",
  author: {
    nickname: "나오",
    profileImageUrl: null,
    serverName: "류트",
    verified: false,
  },
  media: [],
  viewCount: 10,
  likeCount: 2,
  commentCount: 1,
  liked: false,
  bookmarked: false,
  createdAt: "2026-11-05T00:00:00.000Z",
  updatedAt: "2026-11-05T00:00:00.000Z",
};

describe("PostCard", () => {
  const card = (item: PostSummary) => (
    <QueryClientProvider client={new QueryClient()}>
      <PostCard post={item} />
    </QueryClientProvider>
  );

  it("reconciles personalized reactions and later count updates", () => {
    const view = render(card(post));
    view.rerender(
      card({ ...post, liked: true, likeCount: 8, bookmarked: true }),
    );
    expect(screen.getByRole("button", { name: "좋아요" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "좋아요" })).toHaveTextContent(
      "8",
    );
    expect(screen.getByRole("button", { name: "즐겨찾기" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    view.rerender(card({ ...post, likeCount: 9 }));
    expect(screen.getByRole("button", { name: "좋아요" })).toHaveTextContent(
      "9",
    );
    expect(screen.getByRole("button", { name: "좋아요" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("keeps a pending optimistic reaction, blocks duplicate clicks and rolls back to fresh props", async () => {
    let reject!: (error: Error) => void;
    (clientAxios.post as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((_, fail) => {
          reject = fail;
        }),
    );
    const view = render(card(post));
    const like = screen.getByRole("button", { name: "좋아요" });
    fireEvent.click(like);
    expect(like).toBeDisabled();
    fireEvent.click(like);
    view.rerender(card({ ...post, likeCount: 10 }));
    expect(like).toHaveAttribute("aria-pressed", "true");
    expect(like).toHaveTextContent("3");
    await act(async () => reject(new Error("failed")));
    expect(like).toHaveAttribute("aria-pressed", "false");
    expect(like).toHaveTextContent("10");
    expect(like).not.toBeDisabled();
  });

  it("restores the last successful local state when a subsequent toggle fails before refresh", async () => {
    (clientAxios.post as jest.Mock)
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error("failed"));
    render(card(post));
    const like = screen.getByRole("button", { name: "좋아요" });
    fireEvent.click(like);
    await waitFor(() => expect(like).not.toBeDisabled());
    expect(like).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(like);
    await waitFor(() => expect(like).not.toBeDisabled());
    expect(like).toHaveAttribute("aria-pressed", "true");
    expect(like).toHaveTextContent("3");
  });

  it("hydrates the timestamp without recoverable errors across server/client clocks", async () => {
    const clock = jest
      .spyOn(Date, "now")
      .mockReturnValue(Date.parse("2026-11-11T00:00:00Z"));
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      card({ ...post, createdAt: "2026-11-10 00:37:53" }),
    );
    document.body.append(container);
    clock.mockReturnValue(Date.parse("2026-11-12T12:00:00Z"));
    const onRecoverableError = jest.fn();
    let root!: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(
        container,
        card({ ...post, createdAt: "2026-11-10 00:37:53" }),
        { onRecoverableError },
      );
    });
    expect(onRecoverableError).not.toHaveBeenCalled();
    await act(async () => root.unmount());
    container.remove();
    clock.mockRestore();
  });

  it("retains a successful like across stale in-flight props, then accepts the authoritative refresh", async () => {
    let resolve!: (value: object) => void;
    (clientAxios.post as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const view = render(card(post));
    const like = screen.getByRole("button", { name: "좋아요" });
    fireEvent.click(like);
    view.rerender(card({ ...post, likeCount: 10 }));
    await act(async () => resolve({}));
    expect(like).toHaveAttribute("aria-pressed", "true");
    expect(like).toHaveTextContent("11");
    view.rerender(card({ ...post, liked: true, likeCount: 12 }));
    expect(like).toHaveTextContent("12");
    view.rerender(card({ ...post, liked: false, likeCount: 11 }));
    expect(like).toHaveAttribute("aria-pressed", "false");
  });
  const renderCard = (item: PostSummary = post) =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <PostCard post={item} />
      </QueryClientProvider>,
    );
  beforeEach(() =>
    mockUseAuth.mockReturnValue({ user: null, isAuthenticated: false }),
  );

  it("links both author affordances to the public profile", () => {
    renderCard();
    expect(screen.getAllByRole("link", { name: /나오/ })).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: expect.stringContaining("/profile/42"),
        }),
      ]),
    );
  });

  it("인증된 작성자 이름 앞에 서버 약어를 표시한다", () => {
    renderCard({
      ...post,
      author: { ...post.author, verified: true },
    });
    expect(screen.getByLabelText("류트 서버")).toHaveTextContent("LT");
  });

  it("작성자 응답의 활동 등급을 정규화 후에도 유지한다", () => {
    const item = normalizePostSummary({
      ...post,
      author: {
        ...post.author,
        verified: true,
        activityGrade: "MASTER",
        arcana: "DARK_MAGE",
      },
    });
    renderCard(item);
    expect(screen.getByLabelText("활동 등급: 마스터")).toBeInTheDocument();
    expect(screen.getByLabelText("활동 등급: 마스터").closest("a")).toBeNull();
    expect(screen.getByText("다크 메이지")).toBeInTheDocument();
    expect(
      screen.getByLabelText("활동 등급: 마스터").parentElement,
    ).toHaveTextContent(/마스터·다크 메이지·/);
  });

  it("미인증 작성자에는 서버 약어를 표시하지 않는다", () => {
    renderCard();
    expect(screen.queryByLabelText("류트 서버")).not.toBeInTheDocument();
  });

  it.each([1, 2, 5])(
    "keeps every image linked to the post with %i attachments",
    (count) => {
      renderCard({
        ...post,
        media: Array.from({ length: count }, (_, index) => ({
          id: index + 1,
          kind: "IMAGE" as const,
          url: `/sample-${index}.png`,
          contentType: "image/png",
          displayOrder: index,
        })),
      });
      const images = screen.getAllByRole("img", { name: "게시글 첨부 이미지" });
      expect(images).toHaveLength(count);
      images.forEach((image) => {
        expect(image.closest("a")).toHaveAttribute("href", "/community/7");
      });
    },
  );

  it("preserves native video controls without autoplay alongside images", () => {
    const { container } = renderCard({
      ...post,
      media: [
        {
          id: 1,
          kind: "VIDEO",
          url: "/sample.webm",
          contentType: "video/webm",
          displayOrder: 0,
        },
        {
          id: 2,
          kind: "IMAGE",
          url: "/sample.png",
          contentType: "image/png",
          displayOrder: 1,
        },
      ],
    });
    const video = container.querySelector("video");
    expect(video).toHaveAttribute("controls");
    expect(video).not.toHaveAttribute("autoplay");
    expect(
      screen.getByRole("img", { name: "게시글 첨부 이미지" }).closest("a"),
    ).toHaveAttribute("href", "/community/7");
  });

  it("rolls back an optimistic bookmark when the request fails", async () => {
    (clientAxios.request as jest.Mock).mockRejectedValueOnce(new Error("fail"));
    renderCard();
    const bookmark = screen.getByRole("button", { name: "즐겨찾기" });
    fireEvent.click(bookmark);
    expect(bookmark).toHaveAttribute("aria-pressed", "true");
    await waitFor(() =>
      expect(bookmark).toHaveAttribute("aria-pressed", "false"),
    );
  });

  it("shows edit/delete only to the author and submits retained media through multipart PATCH", async () => {
    mockUseAuth.mockReturnValue({
      user: { userId: 42 },
      isAuthenticated: true,
    });
    (clientAxios.patch as jest.Mock).mockResolvedValueOnce({});
    renderCard();
    fireEvent.click(screen.getByRole("button", { name: "게시글 메뉴" }));
    expect(screen.getByRole("button", { name: /수정/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /삭제/ })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "신고하기" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /수정/ }));
    fireEvent.click(screen.getByRole("button", { name: "수정" }));
    await waitFor(() =>
      expect(clientAxios.patch).toHaveBeenCalledWith(
        "/posts/7",
        expect.any(FormData),
        { timeout: 120_000 },
      ),
    );
    const formData = (clientAxios.patch as jest.Mock).mock
      .calls[0][1] as FormData;
    const payload = JSON.parse(await (formData.get("data") as Blob).text());
    expect(payload).toMatchObject({
      content: "평범한 하루",
      retainedMediaIds: [],
    });
  });
});
