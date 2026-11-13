import type { PageMeta, PostFeedItem } from "@/types/community";

export interface BackendPostSummary
  extends Omit<Partial<PostFeedItem>, "media"> {
  id: number;
  userId: number;
  username?: string;
  title?: string;
  content?: string;
  imageUrlList?: string[];
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  createdAt: string;
  updatedAt?: string;
  media?: Array<{
    id: number;
    kind?: "IMAGE" | "VIDEO";
    type?: "IMAGE" | "VIDEO";
    url: string;
    contentType: string;
    displayOrder?: number;
    order?: number;
  }>;
}

export type PostSummary = PostFeedItem & {
  title: string;
  username: string;
};

export interface BackendPostsData {
  items: BackendPostSummary[];
  meta: PageMeta;
}

export interface PostsData {
  items: PostSummary[];
  meta: PageMeta;
}

export const normalizePostSummary = (post: BackendPostSummary): PostSummary => {
  const nickname =
    post.author?.nickname?.trim() ||
    post.username?.trim() ||
    `사용자 ${post.userId}`;
  const content = post.content?.trim() || post.title?.trim() || "";
  const media =
    post.media
      ?.map((item) => ({
        ...item,
        kind: item.kind ?? item.type ?? "IMAGE",
        displayOrder: item.displayOrder ?? item.order ?? 0,
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder) ??
    (post.imageUrlList ?? []).map((url, index) => ({
      id: -(index + 1),
      kind: "IMAGE" as const,
      url,
      contentType: "image/jpeg",
      displayOrder: index,
    }));

  return {
    id: post.id,
    userId: post.userId,
    username: nickname,
    title: content,
    author: {
      nickname,
      profileImageUrl: post.author?.profileImageUrl ?? null,
      serverName: post.author?.serverName ?? null,
      verified: post.author?.verified ?? false,
      activityGrade: post.author?.activityGrade ?? null,
      arcana: post.author?.arcana ?? null,
    },
    content,
    media,
    viewCount: post.viewCount ?? 0,
    likeCount: post.likeCount ?? 0,
    commentCount: post.commentCount ?? 0,
    liked: post.liked ?? false,
    bookmarked: post.bookmarked ?? false,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt ?? post.createdAt,
  };
};
