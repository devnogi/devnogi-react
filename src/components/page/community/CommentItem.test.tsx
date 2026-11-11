import { fireEvent, render, screen, within } from "@testing-library/react";

import CommentItem from "./CommentItem";

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: null, isAuthenticated: false }),
}));
jest.mock("@/lib/api/clients", () => ({
  clientAxios: { post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));
jest.mock(
  "./CommentForm",
  () =>
    function MockCommentForm() {
      return <div>답글 입력 폼</div>;
    },
);
jest.mock("./ReportDialog", () => () => null);

const comment = {
  id: 1,
  userId: 42,
  nickname: "나오",
  profileImageUrl: null,
  serverName: "만돌린",
  parentComment: null,
  content: "함께 사냥해요.",
  likeCount: 0,
  isDeleted: false,
  isBlocked: false,
  isLiked: false,
  createdAt: "2026-11-07T00:00:00Z",
  updatedAt: "2026-11-07T00:00:00Z",
  verified: true,
  activityGrade: "SENIOR" as const,
};

it("인증된 댓글 작성자 이름 앞에 서버 약어를 표시한다", () => {
  render(<CommentItem comment={comment} postId="7" />);
  expect(screen.getByLabelText("만돌린 서버")).toHaveTextContent("MD");
  expect(screen.getByLabelText("활동 등급: 수석")).toBeInTheDocument();
});

it("미인증 댓글 작성자에는 서버 약어를 표시하지 않는다", () => {
  render(<CommentItem comment={{ ...comment, verified: false }} postId="7" />);
  expect(screen.queryByLabelText("만돌린 서버")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("활동 등급: 수석")).not.toBeInTheDocument();
});

it.each([
  ["댓글", false],
  ["대댓글", true],
])("%s 작성자의 프로필 이미지를 원형 아바타에 표시한다", (_, isReply) => {
  const profileImageUrl = "https://cdn.example.com/profile/42.png";

  render(
    <CommentItem
      comment={{ ...comment, profileImageUrl }}
      postId="7"
      isReply={isReply}
    />,
  );

  expect(screen.getByAltText("나오 프로필 사진")).toHaveAttribute(
    "src",
    profileImageUrl,
  );
});

it("프로필 이미지가 없으면 기존 이니셜 아바타를 유지한다", () => {
  render(<CommentItem comment={comment} postId="7" />);

  const profileLink = screen.getByRole("link", { name: "나오 프로필" });
  expect(within(profileLink).getByText("나")).toBeInTheDocument();
  expect(within(profileLink).queryByRole("img")).not.toBeInTheDocument();
});

it("대댓글 작성 폼을 카드 경계에서 분리된 여백 안에 표시한다", () => {
  render(<CommentItem comment={comment} postId="7" />);

  fireEvent.click(screen.getByRole("button", { name: "답글" }));

  expect(screen.getByRole("region", { name: "답글 작성" })).toHaveClass(
    "mr-3",
    "rounded-xl",
    "border",
    "p-3",
    "md:p-4",
  );
});
