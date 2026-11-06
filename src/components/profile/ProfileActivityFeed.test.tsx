import { fireEvent, render, screen } from "@testing-library/react";

import { useInfinitePosts } from "@/hooks/useInfinitePosts";
import { useInfiniteUserComments } from "@/hooks/useInfiniteUserComments";

import ProfileActivityFeed from "./ProfileActivityFeed";

const replace = jest.fn();
let query = "";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/profile/42",
  useSearchParams: () => new URLSearchParams(query),
}));
jest.mock("@/hooks/useInfinitePosts", () => ({ useInfinitePosts: jest.fn() }));
jest.mock("@/hooks/useInfiniteUserComments", () => ({
  useInfiniteUserComments: jest.fn(),
}));

const postsResult = {
  data: {
    pages: [
      {
        items: [
          {
            id: 101,
            title: "오늘의 훈련 기록",
            userId: 42,
            username: "밀레시안",
            viewCount: 10,
            likeCount: 2,
            commentCount: 1,
            createdAt: "2026-11-05T02:00:00Z",
            author: {
              id: 42,
              username: "밀레시안",
              nickname: "밀레시안",
              serverName: "하프",
              verified: true,
            },
          },
        ],
        meta: { isLast: true },
      },
    ],
  },
  isLoading: false,
  isError: false,
  refetch: jest.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
  fetchNextPage: jest.fn(),
};

const commentsResult = {
  data: {
    pages: [
      {
        items: [
          {
            id: 501,
            postId: 101,
            postTitle: "오늘의 훈련 기록",
            content: "다음에는 함께해요!",
            likeCount: 3,
            createdAt: "2026-11-05T03:00:00Z",
            serverName: "울프",
            verified: true,
          },
        ],
        meta: { isLast: true },
      },
    ],
  },
  isLoading: false,
  isError: false,
  refetch: jest.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
  fetchNextPage: jest.fn(),
};

beforeEach(() => {
  query = "";
  replace.mockClear();
  jest
    .mocked(useInfinitePosts)
    .mockReturnValue(
      postsResult as unknown as ReturnType<typeof useInfinitePosts>,
    );
  jest
    .mocked(useInfiniteUserComments)
    .mockReturnValue(
      commentsResult as unknown as ReturnType<typeof useInfiniteUserComments>,
    );
});

it("게시글을 기본 피드로 표시하고 댓글 탭을 URL 상태로 전환한다", () => {
  render(<ProfileActivityFeed userId={42} />);
  expect(screen.getByText("오늘의 훈련 기록").closest("a")).toHaveAttribute(
    "href",
    "/community/101",
  );
  expect(screen.getByLabelText("하프 서버")).toHaveTextContent("HP");
  fireEvent.click(screen.getByRole("tab", { name: "댓글" }));
  expect(replace).toHaveBeenCalledWith("/profile/42?tab=comments", {
    scroll: false,
  });
});

it("댓글 탭에서 원문 게시글 링크와 공개 내용을 표시한다", () => {
  query = "tab=comments";
  render(<ProfileActivityFeed userId={42} />);
  expect(screen.getByText("다음에는 함께해요!").closest("a")).toHaveAttribute(
    "href",
    "/community/101",
  );
  expect(screen.getByRole("tab", { name: "댓글" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.getByLabelText("울프 서버")).toHaveTextContent("WF");
});

it("탭별 오류에서 재시도를 제공한다", () => {
  const refetch = jest.fn();
  jest.mocked(useInfinitePosts).mockReturnValue({
    ...postsResult,
    data: undefined,
    isError: true,
    refetch,
  } as unknown as ReturnType<typeof useInfinitePosts>);
  render(<ProfileActivityFeed userId={42} />);
  fireEvent.click(screen.getByRole("button", { name: /다시 시도/ }));
  expect(refetch).toHaveBeenCalledTimes(1);
});

it("활동이 없으면 탭별 빈 상태를 표시한다", () => {
  jest.mocked(useInfinitePosts).mockReturnValue({
    ...postsResult,
    data: { pages: [{ items: [], meta: { isLast: true } }] },
  } as unknown as ReturnType<typeof useInfinitePosts>);
  render(<ProfileActivityFeed userId={42} />);
  expect(
    screen.getByText("아직 공개된 게시글이 없습니다."),
  ).toBeInTheDocument();
});
