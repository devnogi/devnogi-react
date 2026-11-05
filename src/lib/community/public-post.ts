import { cache } from "react";

export interface PostDetail {
  id: number;
  boardId: number;
  userId: number;
  username: string;
  title: string;
  content: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isDraft: boolean;
  isBlocked: boolean;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  imageUrlList?: string[];
  verified?: boolean;
  author?: {
    nickname: string;
    profileImageUrl: string | null;
    serverName: string | null;
    verified: boolean;
  };
  media?: Array<{
    id: number;
    kind?: "IMAGE" | "VIDEO";
    type?: "IMAGE" | "VIDEO";
    url: string;
    contentType: string;
    displayOrder?: number;
    order?: number;
  }>;
  liked?: boolean;
  bookmarked?: boolean;
  isBookmarked?: boolean;
}

export type PublicPostResult =
  | { status: "available"; post: PostDetail }
  | { status: "not-found" | "not-public" | "unavailable" };

interface ApiResponse<T> {
  success: boolean;
  data?: T;
}

function isPostDetail(value: unknown): value is PostDetail {
  if (!value || typeof value !== "object") return false;

  const post = value as Partial<PostDetail>;
  return (
    typeof post.id === "number" &&
    typeof post.userId === "number" &&
    (typeof post.username === "string" ||
      typeof post.author?.nickname === "string") &&
    (typeof post.title === "string" || typeof post.content === "string") &&
    typeof post.content === "string" &&
    typeof post.createdAt === "string" &&
    typeof post.updatedAt === "string"
  );
}

export function isPublicPost(post: PostDetail): boolean {
  return post.isDraft !== true && post.isBlocked !== true;
}

/**
 * Gets only content that is safe to use in a public page's metadata or initial
 * HTML. Authentication headers are intentionally not forwarded: personal
 * state such as likes must continue to be fetched by the client after hydration.
 */
export const getPublicPost = cache(
  async (postId: number): Promise<PublicPostResult> => {
    if (!Number.isSafeInteger(postId) || postId <= 0) {
      return { status: "not-found" };
    }

    const gatewayUrl = process.env.GATEWAY_URL;
    if (!gatewayUrl) {
      return { status: "unavailable" };
    }

    try {
      const response = await fetch(
        new URL(`/dcs/api/posts/details/${postId}`, gatewayUrl),
        {
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
          headers: { Accept: "application/json" },
        },
      );

      if (response.status === 404) {
        return { status: "not-found" };
      }
      if (!response.ok) {
        return { status: "unavailable" };
      }

      const payload = (await response.json()) as ApiResponse<unknown>;
      if (!payload.success || !isPostDetail(payload.data)) {
        return { status: "unavailable" };
      }

      if (!isPublicPost(payload.data)) {
        return { status: "not-public" };
      }
      if (
        typeof payload.data.title !== "string" ||
        typeof payload.data.username !== "string" ||
        typeof payload.data.boardId !== "number"
      ) {
        return {
          status: "available",
          post: {
            ...payload.data,
            boardId: payload.data.boardId ?? 0,
            title: payload.data.content,
            username:
              payload.data.author?.nickname ?? `사용자 ${payload.data.userId}`,
            isDraft: payload.data.isDraft ?? false,
            isBlocked: payload.data.isBlocked ?? false,
            isLiked: payload.data.isLiked ?? payload.data.liked ?? false,
          },
        };
      }
      return { status: "available", post: payload.data };
    } catch {
      return { status: "unavailable" };
    }
  },
);
