import { fireEvent, render, screen } from "@testing-library/react";

import {
  normalizePostSummary,
  useInfinitePosts,
} from "@/hooks/useInfinitePosts";

import HomePopularPosts from "./HomePopularPosts";
jest.mock("@/hooks/useInfinitePosts", () => ({
  ...jest.requireActual("@/hooks/useInfinitePosts"),
  useInfinitePosts: jest.fn(),
}));
const hook = jest.mocked(useInfinitePosts);
const post = (id: number) =>
  normalizePostSummary({
    id,
    userId: id,
    content: `본문 ${id}`,
    createdAt: "2026-11-01T00:00:00Z",
    username: `작성자 ${id}`,
    commentCount: id,
    likeCount: id + 1,
  });
function state(value: object) {
  hook.mockReturnValue({
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    ...value,
  } as unknown as ReturnType<typeof useInfinitePosts>);
}
it.each([0, 1, 5, 10])(
  "첫 페이지 %i개에서 최대 다섯 개만 서버 순서대로 표시한다",
  (count) => {
    const items = Array.from({ length: count }, (_, i) => post(20 - i));
    state({ data: { pages: [{ items }, { items: [post(99)] }] } });
    render(<HomePopularPosts />);
    expect(hook).toHaveBeenCalledWith({ tab: "popular", size: 10 });
    const links = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") !== "/community");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      items.slice(0, 5).map((item) => `/community/${item.id}`),
    );
    expect(screen.queryByText("본문 99")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "커뮤니티 보기" })).toHaveAttribute(
      "href",
      "/community",
    );
  },
);
it("빈 결과와 로딩 상태를 표시한다", () => {
  state({ isLoading: true });
  const { rerender } = render(<HomePopularPosts />);
  expect(
    screen.getByRole("status", { name: "인기 게시글 불러오는 중" }),
  ).toBeInTheDocument();
  state({ data: { pages: [{ items: [] }] } });
  rerender(<HomePopularPosts />);
  expect(screen.getByText("아직 인기 게시글이 없어요.")).toBeInTheDocument();
});
it("오류 재시도는 기존 refetch를 호출한다", () => {
  const refetch = jest.fn();
  state({ isError: true, refetch });
  render(<HomePopularPosts />);
  fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
  expect(refetch).toHaveBeenCalledTimes(1);
});
it("미디어 전용 글을 사실에 맞는 문구로 표시한다", () => {
  const photo = { ...post(1), title: "", media: [{ kind: "IMAGE" }] };
  const video = { ...post(2), title: " ", media: [{ kind: "VIDEO" }] };
  state({ data: { pages: [{ items: [photo, video] }] } });
  render(<HomePopularPosts />);
  expect(screen.getByRole("link", { name: "사진 게시글" })).toHaveAttribute(
    "href",
    "/community/1",
  );
  expect(screen.getByRole("link", { name: "동영상 게시글" })).toHaveAttribute(
    "href",
    "/community/2",
  );
});
