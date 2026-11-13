import { cache } from "react";

import type { BackendPostsData } from "@/lib/community/feed";
import { PublicApiError, publicJson } from "@/lib/seo/public-api";

export const getPublicFeed = cache(async (page: number, keyword = "") => {
  const params = new URLSearchParams({
    tab: "LATEST",
    page: String(page),
    size: "20",
  });
  if (keyword.trim()) params.set("keyword", keyword.trim());
  const data = await publicJson<BackendPostsData>(
    `/dcs/api/posts/feed?${params}`,
  );
  if (
    !Array.isArray(data?.items) ||
    !data.meta ||
    !Number.isInteger(data.meta.currentPage)
  ) {
    throw new PublicApiError(502);
  }
  return {
    meta: data.meta,
    items: data.items.map((post) => ({
      id: post.id,
      userId: post.userId,
      author: post.author,
      content: post.content,
      media: post.media,
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    })),
  } satisfies BackendPostsData;
});
