import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

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
      author: { ...post.author, verified: true, activityGrade: "MASTER" },
    });
    renderCard(item);
    expect(screen.getByLabelText("활동 등급: 마스터")).toBeInTheDocument();
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
