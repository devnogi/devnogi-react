import { isPublicPost, type PostDetail } from "./public-post";

const post: PostDetail = {
  id: 1,
  boardId: 2,
  userId: 3,
  username: "테스터",
  title: "공개 게시글",
  content: "본문",
  viewCount: 0,
  likeCount: 0,
  commentCount: 0,
  isDraft: false,
  isBlocked: false,
  isLiked: false,
  createdAt: "2026-10-29T00:00:00.000Z",
  updatedAt: "2026-10-29T00:00:00.000Z",
};

describe("isPublicPost", () => {
  it("accepts a post that is neither draft nor blocked", () => {
    expect(isPublicPost(post)).toBe(true);
  });

  it.each([
    { ...post, isDraft: true },
    { ...post, isBlocked: true },
  ])("rejects drafts and blocked posts", (nonPublicPost) => {
    expect(isPublicPost(nonPublicPost)).toBe(false);
  });
});
