import { render, screen } from "@testing-library/react";

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
jest.mock("./CommentForm", () => () => null);
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
};

it("인증된 댓글 작성자 이름 앞에 서버 약어를 표시한다", () => {
  render(<CommentItem comment={comment} postId="7" />);
  expect(screen.getByLabelText("만돌린 서버")).toHaveTextContent("MD");
});

it("미인증 댓글 작성자에는 서버 약어를 표시하지 않는다", () => {
  render(<CommentItem comment={{ ...comment, verified: false }} postId="7" />);
  expect(screen.queryByLabelText("만돌린 서버")).not.toBeInTheDocument();
});
