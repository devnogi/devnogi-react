"use client";

import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Heart, MessageCircle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import ActivityGradeBadge from "@/components/ui/ActivityGradeBadge";
import { Button } from "@/components/ui/button";
import ServerCodeBadge from "@/components/ui/ServerCodeBadge";
import { useInfinitePosts } from "@/hooks/useInfinitePosts";
import { useInfiniteUserComments } from "@/hooks/useInfiniteUserComments";

type ActivityTab = "posts" | "comments";

function relativeDate(value: string) {
  return formatDistanceToNow(new Date(value), { addSuffix: true, locale: ko });
}

export default function ProfileActivityFeed({ userId }: { userId: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab: ActivityTab =
    searchParams.get("tab") === "comments" ? "comments" : "posts";
  const posts = useInfinitePosts({ userId, enabled: tab === "posts" });
  const comments = useInfiniteUserComments(userId, 20, tab === "comments");

  const changeTab = (nextTab: ActivityTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextTab === "posts") params.delete("tab");
    else params.set("tab", nextTab);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  return (
    <section aria-labelledby="activity-heading" className="mt-6">
      <h2 id="activity-heading" className="sr-only">
        공개 활동
      </h2>
      <div
        role="tablist"
        aria-label="공개 활동 종류"
        className="flex border-b border-border"
      >
        {(
          [
            ["posts", "게시글"],
            ["comments", "댓글"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => changeTab(value)}
            className={`relative min-w-24 px-5 py-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:focus-visible:ring-offset-navy-900 ${
              tab === value
                ? "text-[var(--color-ds-primary)] after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-primary"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "posts" ? (
        <ActivityState
          loading={posts.isLoading}
          error={posts.isError}
          empty={
            !posts.isLoading &&
            !posts.data?.pages.some((page) => page.items.length)
          }
          emptyText="아직 공개된 게시글이 없습니다."
          onRetry={() => posts.refetch()}
          hasNextPage={posts.hasNextPage}
          isFetchingNextPage={posts.isFetchingNextPage}
          onMore={() => posts.fetchNextPage()}
        >
          {posts.data?.pages.flatMap((page) =>
            page.items.map((post) => (
              <Link
                key={post.id}
                href={`/community/${post.id}`}
                prefetch={false}
                className="block border-b border-border px-1 py-5 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring sm:px-4"
              >
                <article>
                  <div className="flex items-center justify-between gap-3 text-xs leading-[18px] text-muted-foreground">
                    <div className="flex min-w-0 items-center gap-2">
                      <ServerCodeBadge
                        serverName={post.author.serverName}
                        verified={post.author.verified}
                      />
                      <ActivityGradeBadge
                        grade={post.author.activityGrade}
                        verified={post.author.verified}
                      />
                      <time dateTime={post.createdAt}>
                        {relativeDate(post.createdAt)}
                      </time>
                    </div>
                    <span>{post.viewCount.toLocaleString()}회 조회</span>
                  </div>
                  <h3 className="mt-2 break-words text-[15px] leading-6 font-normal tracking-[-0.01em] text-foreground">
                    {post.title}
                  </h3>
                  <div className="mt-3 flex gap-6 text-xs leading-[18px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="h-[18px] w-[18px]" aria-hidden="true" />
                      {post.likeCount.toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle
                        className="h-[18px] w-[18px]"
                        aria-hidden="true"
                      />
                      {post.commentCount.toLocaleString()}
                    </span>
                  </div>
                </article>
              </Link>
            )),
          )}
        </ActivityState>
      ) : (
        <ActivityState
          loading={comments.isLoading}
          error={comments.isError}
          empty={
            !comments.isLoading &&
            !comments.data?.pages.some((page) => page.items.length)
          }
          emptyText="아직 공개된 댓글이 없습니다."
          onRetry={() => comments.refetch()}
          hasNextPage={comments.hasNextPage}
          isFetchingNextPage={comments.isFetchingNextPage}
          onMore={() => comments.fetchNextPage()}
        >
          {comments.data?.pages.flatMap((page) =>
            page.items.map((comment) => (
              <Link
                key={comment.id}
                href={`/community/${comment.postId}`}
                prefetch={false}
                className="block border-b border-border px-1 py-5 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring sm:px-4"
              >
                <article>
                  <div className="flex items-center justify-between gap-3 text-xs leading-[18px] text-muted-foreground">
                    <div className="flex min-w-0 items-center gap-2">
                      <ServerCodeBadge
                        serverName={comment.serverName}
                        verified={comment.verified}
                      />
                      <ActivityGradeBadge
                        grade={comment.activityGrade}
                        verified={comment.verified}
                      />
                      <span className="truncate">{comment.postTitle}</span>
                    </div>
                    <time className="shrink-0" dateTime={comment.createdAt}>
                      {relativeDate(comment.createdAt)}
                    </time>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-6 font-normal tracking-[-0.01em] text-foreground">
                    {comment.content}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs leading-[18px] text-muted-foreground">
                    <Heart className="h-[18px] w-[18px]" aria-hidden="true" />
                    {comment.likeCount.toLocaleString()}
                  </span>
                </article>
              </Link>
            )),
          )}
        </ActivityState>
      )}
    </section>
  );
}

function ActivityState({
  loading,
  error,
  empty,
  emptyText,
  onRetry,
  hasNextPage,
  isFetchingNextPage,
  onMore,
  children,
}: {
  loading: boolean;
  error: boolean;
  empty: boolean;
  emptyText: string;
  onRetry: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onMore: () => void;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <div
        className="py-16 text-center text-sm text-gray-600 dark:text-gray-400"
        role="status"
      >
        활동을 불러오는 중입니다.
      </div>
    );
  }
  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          활동을 불러오지 못했습니다.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={onRetry}
        >
          <RotateCcw className="mr-2 h-[18px] w-[18px]" aria-hidden="true" />
          다시 시도
        </Button>
      </div>
    );
  }
  if (empty) {
    return (
      <p className="py-16 text-center text-sm text-gray-600 dark:text-gray-400">
        {emptyText}
      </p>
    );
  }
  return (
    <div>
      <div>{children}</div>
      {hasNextPage ? (
        <div className="pt-6 text-center">
          <Button
            type="button"
            variant="outline"
            onClick={onMore}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "불러오는 중..." : "더 보기"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
