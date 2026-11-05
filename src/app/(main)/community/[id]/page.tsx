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
    "@type": "Article",
    headline: derivePostTitle(post.content),
    description: toDescription(post),
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.username,
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

  if (result.status !== "available") {
    return {
      title: "커뮤니티 게시글",
      robots: { index: false, follow: false },
    };
  }

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

  if (result.status === "not-found") {
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
    <div className="mx-auto w-full max-w-[1000px] pb-8">
      <nav
        aria-label="현재 위치"
        className="mb-4 text-sm text-gray-600 dark:text-gray-400"
      >
        <ol className="flex items-center gap-2">
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
            __html: articleJsonLd(initialPost, canonicalPath),
          }}
        />
      )}
      <div className="lg:grid lg:grid-cols-[minmax(0,680px)_280px] lg:gap-5">
        <section className="min-w-0 flex flex-col gap-4 md:gap-6">
          {/* Post Detail */}
          <PostDetailView
            postId={id}
            initialPost={initialPost}
            cacheScope={cacheScope}
          />

          {/* Comments Section */}
          <div className="w-full">
            <div
              id="comments"
              className="bg-white dark:bg-navy-800 rounded-lg border border-gray-200 dark:border-navy-600 p-4 md:p-5"
            >
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
