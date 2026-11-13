import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import CommentList from "@/components/page/community/CommentList";
import PopularPostsHighlight from "@/components/page/community/PopularPostsHighlight";
import PostDetailView from "@/components/page/community/PostDetailView";
import RelatedPostsSection from "@/components/page/community/RelatedPostsSection";
import {
  derivePostTitle,
  normalizeExcerpt,
} from "@/lib/community/post-content";
import { getPublicPost, type PostDetail } from "@/lib/community/public-post";
import { canonicalUrl } from "@/lib/seo/site";
import { breadcrumbs, jsonLd } from "@/lib/seo/structured-data";

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";

function toDescription(post: PostDetail): string {
  return normalizeExcerpt(post.content, 140) || "메모노기 커뮤니티 게시글";
}

function articleJsonLd(post: PostDetail, postPath: string) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    text: post.content,
    headline: derivePostTitle(post.content),
    description: toDescription(post),
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.username,
      url: canonicalUrl(`/profile/${post.userId}`),
    },
    mainEntityOfPage: canonicalUrl(postPath),
  }).replace(/</g, "\\u003c");
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const postId = Number(id);
  const result = await getPublicPost(postId);

  if (result.status === "unavailable")
    throw new Error("공개 게시글을 불러오지 못했어요.");
  if (result.status !== "available") notFound();

  return {
    title: derivePostTitle(result.post.content),
    description: toDescription(result.post),
    alternates: { canonical: `/community/${result.post.id}` },
    openGraph: {
      type: "article",
      title: derivePostTitle(result.post.content),
      description: toDescription(result.post),
      url: `/community/${result.post.id}`,
      publishedTime: result.post.createdAt,
      modifiedTime: result.post.updatedAt,
    },
    twitter: {
      card: "summary",
      title: derivePostTitle(result.post.content),
      description: toDescription(result.post),
    },
  };
}

async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const postId = Number(id);
  const result = await getPublicPost(postId);

  if (result.status === "unavailable")
    throw new Error("공개 게시글을 불러오지 못했어요.");
  if (result.status !== "available") {
    notFound();
  }

  const initialPost = result.status === "available" ? result.post : undefined;
  const cacheScope = initialPost
    ? `public:${initialPost.updatedAt}`
    : "restricted";
  const canonicalPath = initialPost
    ? `/community/${initialPost.id}`
    : undefined;

  return (
    <div className="visual-polish social-reading-page mx-auto w-full max-w-[680px] pb-8 lg:max-w-[980px]">
      <nav
        aria-label="현재 위치"
        className="mb-4 px-4 text-sm text-muted-foreground sm:px-0"
      >
        <ol className="flex flex-wrap items-center gap-2 break-words [overflow-wrap:anywhere]">
          <li>
            <Link className="hover:underline" href="/">
              메모노기
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link className="hover:underline" href="/community">
              커뮤니티
            </Link>
          </li>
          {initialPost && (
            <li aria-current="page">{derivePostTitle(initialPost.content)}</li>
          )}
        </ol>
      </nav>
      {initialPost && canonicalPath && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(
              breadcrumbs([
                { name: "마비노기 커뮤니티", path: "/community" },
                {
                  name: derivePostTitle(initialPost.content),
                  path: canonicalPath,
                },
              ]),
            ),
          }}
        />
      )}
      {initialPost && canonicalPath && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: articleJsonLd(initialPost, canonicalPath),
          }}
        />
      )}
      <div className="lg:grid lg:grid-cols-[minmax(0,680px)_280px] lg:gap-5">
        <section className="min-w-0 flex flex-col gap-4 md:gap-6">
          <div className="overflow-hidden border-y border-border bg-card text-card-foreground sm:rounded-[10px] sm:border">
            <PostDetailView
              postId={id}
              initialPost={initialPost}
              cacheScope={cacheScope}
            />
            <div id="comments" className="border-t border-border">
              <CommentList postId={id} />
            </div>
          </div>

          <RelatedPostsSection
            postId={id}
            boardId={initialPost?.boardId}
            cacheScope={cacheScope}
          />
        </section>

        <aside className="hidden lg:block">
          <div className="sticky top-[116px]">
            <PopularPostsHighlight />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default PostPage;
