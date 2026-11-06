import { fireEvent, render, screen } from "@testing-library/react";

import { useAuth } from "@/contexts/AuthContext";
import { useInfinitePosts } from "@/hooks/useInfinitePosts";

import CommunityPage from "./CommunityClient";

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("q=에린"),
}));
jest.mock("@/contexts/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("@/hooks/useInfinitePosts", () => ({ useInfinitePosts: jest.fn() }));
jest.mock("@/components/page/community/PostComposer", () => ({
  __esModule: true,
  default: () => <div>작성 폼</div>,
}));
jest.mock("@/components/page/community/PostList", () => ({
  __esModule: true,
  default: ({ tab, keyword }: { tab: string; keyword: string }) => (
    <div>
      피드 {tab} {keyword}
    </div>
  ),
}));
jest.mock("@/components/page/community/PostCreateModal", () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div role="dialog" aria-label="게시글 작성" /> : null,
}));
jest.mock("@/components/auth/LoginModal", () => ({
  __esModule: true,
  default: ({
    isOpen,
    onClose,
    onLoginSuccess,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
  }) =>
    isOpen ? (
      <div role="dialog" aria-label="로그인">
        <button
          onClick={() => {
            setAuth(true);
            onLoginSuccess();
            onClose();
          }}
        >
          로그인 완료
        </button>
        <button onClick={onClose}>닫기</button>
      </div>
    ) : null,
}));

function setAuth(isAuthenticated: boolean, isLoading = false) {
  jest
    .mocked(useAuth)
    .mockReturnValue({ isAuthenticated, isLoading } as ReturnType<
      typeof useAuth
    >);
}

function setPopular({
  loading = false,
  error = false,
  populated = false,
} = {}) {
  jest.mocked(useInfinitePosts).mockReturnValue({
    data: {
      pages: [
        {
          items: populated
            ? [
                {
                  id: 1,
                  title: "오늘의 이야기",
                  likeCount: 2,
                  viewCount: 3,
                  commentCount: 1,
                  createdAt: "2026-11-06T10:00:00Z",
                },
              ]
            : [],
        },
      ],
    },
    isLoading: loading,
    isError: error,
  } as unknown as ReturnType<typeof useInfinitePosts>);
}

beforeEach(() => {
  jest.clearAllMocks();
  setAuth(false);
  setPopular();
});

it("인기글을 조회하는 동안 보조 열의 로딩 표시를 유지한다", () => {
  setPopular({ loading: true });
  render(<CommunityPage />);
  expect(
    screen.getByRole("complementary", { name: "인기 게시글" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("status", { name: "인기글을 불러오는 중" }),
  ).toBeInTheDocument();
  expect(useInfinitePosts).toHaveBeenCalledWith({ tab: "popular", size: 10 });
});

it("조회된 인기글이 있으면 기존 상세 링크와 보조 열을 표시한다", () => {
  setPopular({ populated: true });
  render(<CommunityPage />);
  expect(screen.getByText("오늘의 이야기").closest("a")).toHaveAttribute(
    "href",
    "/community/1",
  );
  expect(screen.getByRole("complementary")).toBeInTheDocument();
});

it.each([false, true])(
  "인기글이 비었거나 실패하면 빈 보조 열을 제거한다 (error=%s)",
  (error) => {
    setPopular({ error, populated: error });
    render(<CommunityPage />);
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    expect(screen.getByText("피드 latest 에린")).toBeInTheDocument();
  },
);

it("인증 확인 중에는 로그인 CTA 대신 상태 표시를 하고 글쓰기를 비활성화한다", () => {
  setAuth(false, true);
  render(<CommunityPage />);
  expect(screen.getByRole("status")).toHaveTextContent(
    "로그인 상태를 확인하는 중입니다.",
  );
  expect(
    screen.queryByRole("button", { name: "로그인하고 이야기 남기기" }),
  ).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "글쓰기" })).toBeDisabled();
  expect(screen.queryByText("작성 폼")).not.toBeInTheDocument();
});

it.each(["로그인하고 이야기 남기기", "글쓰기"])(
  "비로그인 %s에서 로그인한 뒤 작성 흐름을 이어간다",
  (name) => {
    render(<CommunityPage />);
    expect(screen.queryByText("작성 폼")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name }));
    expect(screen.getByRole("dialog", { name: "로그인" })).toBeInTheDocument();
    expect(
      screen.queryByRole("dialog", { name: "게시글 작성" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "로그인 완료" }));
    expect(
      screen.getByRole("dialog", { name: "게시글 작성" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("dialog", { name: "로그인" }),
    ).not.toBeInTheDocument();
  },
);

it("로그인 상태의 작성 폼과 피드 탭 전환을 유지한다", () => {
  setAuth(true);
  render(<CommunityPage />);
  expect(screen.getByText("작성 폼")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "인기" }));
  expect(screen.getByText("피드 popular 에린")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "글쓰기" }));
  expect(
    screen.getByRole("dialog", { name: "게시글 작성" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("dialog", { name: "로그인" }),
  ).not.toBeInTheDocument();
});
