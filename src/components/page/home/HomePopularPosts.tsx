"use client";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronRight, Heart, MessageCircle } from "lucide-react";
import Link from "next/link";

import { useInfinitePosts } from "@/hooks/useInfinitePosts";

import styles from "./HomeCards.module.css";
export default function HomePopularPosts() {
  const { data, isLoading, isError, refetch } = useInfinitePosts({
    tab: "popular",
    size: 10,
  });
  const posts = data?.pages[0]?.items.slice(0, 5) ?? [];
  return (
    <section
      className={styles.card}
      aria-labelledby="home-popular-posts-heading"
    >
      <div className={styles.heading}>
        <div>
          <h2 id="home-popular-posts-heading" className={styles.title}>
            인기 게시글
          </h2>
          <p className={styles.meta}>밀레시안들의 이야기를 만나보세요</p>
        </div>
      </div>
      {isLoading ? (
        <div role="status" aria-label="인기 게시글 불러오는 중">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className={styles.skeleton}>
              <span />
              <span />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className={styles.state}>
          <p>인기 게시글을 불러오지 못했어요.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 min-h-11 rounded-lg border border-border px-4 text-foreground"
          >
            다시 시도
          </button>
        </div>
      ) : posts.length === 0 ? (
        <p className={styles.state}>아직 인기 게시글이 없어요.</p>
      ) : (
        <ol className={styles.posts}>
          {posts.map((post, index) => (
            <li key={post.id} className={styles.post}>
              <span className={styles.rank}>{index + 1}</span>
              <div className={styles.postBody}>
                <Link
                  className={styles.preview}
                  href={`/community/${post.id}`}
                  prefetch={false}
                >
                  {post.title.trim() ||
                    (post.media.some((media) => media.kind === "VIDEO")
                      ? "동영상 게시글"
                      : "사진 게시글")}
                </Link>
                <div className={styles.postMeta}>
                  <span>
                    {post.author.nickname} ·{" "}
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </span>
                  <span className={styles.stats}>
                    <MessageCircle size={14} aria-label="댓글" />
                    {post.commentCount.toLocaleString()}
                    <Heart size={14} aria-label="좋아요" />
                    {post.likeCount.toLocaleString()}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
      <Link href="/community" className={styles.footer}>
        커뮤니티 보기
        <ChevronRight size={16} aria-hidden="true" />
      </Link>
    </section>
  );
}
