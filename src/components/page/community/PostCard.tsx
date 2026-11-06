"use client";

import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Bookmark,
  Eye,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import ServerCodeBadge from "@/components/ui/ServerCodeBadge";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { useAuth } from "@/contexts/AuthContext";
import type { PostSummary } from "@/hooks/useInfinitePosts";
import { clientAxios } from "@/lib/api/clients";

import PostComposer from "./PostComposer";
import ReportDialog from "./ReportDialog";

interface Props {
  post: PostSummary;
}

export default function PostCard({ post }: Props) {
  const { user, isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [bookmarked, setBookmarked] = useState(post.bookmarked);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const isOwner = user?.userId === post.userId;
  const profileHref = `/profile/${post.userId}`;

  const toggleLike = async () => {
    const previous = liked;
    setLiked(!previous);
    setLikeCount((count) => count + (previous ? -1 : 1));
    try {
      await clientAxios.post("/posts/like", { postId: post.id });
    } catch {
      setLiked(previous);
      setLikeCount((count) => count + (previous ? 1 : -1));
      toast.error("좋아요를 반영하지 못했어요.");
    }
  };

  const toggleBookmark = async () => {
    const previous = bookmarked;
    setBookmarked(!previous);
    try {
      await clientAxios.request({
        url: `/posts/${post.id}/bookmark`,
        method: previous ? "DELETE" : "PUT",
      });
    } catch {
      setBookmarked(previous);
      toast.error("즐겨찾기를 반영하지 못했어요.");
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/community/${post.id}`;
    try {
      if (navigator.share)
        await navigator.share({ text: post.content.slice(0, 100), url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("링크를 복사했어요.");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError")
        toast.error("공유하지 못했어요.");
    }
  };

  const removePost = async () => {
    if (!window.confirm("게시글을 삭제할까요?")) return;
    try {
      await clientAxios.delete(`/posts/${post.id}`);
      setDeleted(true);
      toast.success("게시글을 삭제했어요.");
    } catch {
      toast.error("게시글을 삭제하지 못했어요.");
    }
  };

  if (deleted) return null;
  if (editing) {
    return (
      <article className="border-b border-border bg-card">
        <PostComposer
          postId={post.id}
          initialContent={post.content}
          initialMedia={post.media}
          onCancel={() => setEditing(false)}
          onPosted={() => setEditing(false)}
        />
      </article>
    );
  }

  return (
    <article className="border-b border-border bg-card px-4 py-5 last:border-b-0 sm:px-5">
      <div className="flex gap-3">
        <Link
          href={profileHref}
          className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-primary text-primary-foreground"
          aria-label={`${post.author.nickname} 프로필`}
        >
          {post.author.profileImageUrl ? (
            <img
              src={post.author.profileImageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-sm font-bold">
              {post.author.nickname.slice(0, 1)}
            </span>
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <header className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={profileHref}
                className="inline-flex max-w-full items-center gap-1 text-[15px] leading-[22px] font-semibold tracking-[-0.01em] text-card-foreground hover:underline"
              >
                <ServerCodeBadge
                  serverName={post.author.serverName}
                  verified={post.author.verified}
                />
                <span className="truncate">{post.author.nickname}</span>
                {post.author.verified && <VerifiedBadge size="sm" />}
              </Link>
              <div className="text-xs leading-[18px] text-muted-foreground">
                <span>{post.author.serverName || "에린"}</span>
                <span aria-hidden="true"> · </span>
                <Link
                  href={`/community/${post.id}`}
                  className="hover:underline"
                >
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </Link>
              </div>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex h-11 w-11 items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-700"
                aria-label="게시글 메뉴"
              >
                <MoreHorizontal className="h-[18px] w-[18px]" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 z-10 w-28 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-md dark:border-navy-600 dark:bg-navy-700">
                  {isOwner ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setEditing(true);
                        }}
                        className="flex min-h-11 w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-navy-600"
                      >
                        <Pencil className="h-4 w-4" />
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={removePost}
                        className="flex min-h-11 w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        삭제
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        if (isAuthenticated) setReportOpen(true);
                        else toast.warning("로그인 후 신고할 수 있어요.");
                      }}
                      className="min-h-11 w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      신고하기
                    </button>
                  )}
                </div>
              )}
            </div>
          </header>
          <Link
            href={`/community/${post.id}`}
            className="mt-3 block whitespace-pre-wrap break-words text-[15px] leading-6 font-normal tracking-[-0.01em] text-card-foreground"
          >
            {post.content}
          </Link>
          {post.media.length > 0 && (
            <div
              className={`mt-4 grid gap-1 overflow-hidden rounded-xl border border-border bg-muted ${post.media.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
            >
              {post.media.map((media, index) =>
                media.kind === "VIDEO" ? (
                  <video
                    key={media.id}
                    src={media.url}
                    className={`aspect-video max-h-[520px] w-full min-w-0 self-center bg-black object-contain ${post.media.length % 2 === 1 && post.media.length > 1 && index === 0 ? "col-span-2" : ""}`}
                    controls
                    preload="metadata"
                  />
                ) : (
                  <Link
                    href={`/community/${post.id}`}
                    key={media.id}
                    className={`block min-w-0 ${post.media.length % 2 === 1 && post.media.length > 1 && index === 0 ? "col-span-2" : ""}`}
                  >
                    <img
                      src={media.url}
                      alt="게시글 첨부 이미지"
                      className={`max-h-[520px] w-full object-contain ${post.media.length > 1 ? "aspect-video" : "h-auto"}`}
                    />
                  </Link>
                ),
              )}
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-y-1 text-xs leading-[18px] text-muted-foreground sm:justify-start sm:gap-x-6">
            <Link
              href={`/community/${post.id}#comments`}
              className="flex h-11 min-w-11 items-center gap-1.5 rounded-full px-2 hover:bg-gray-100 dark:hover:bg-navy-700"
              aria-label={`댓글 ${post.commentCount}개`}
            >
              <MessageCircle className="h-[18px] w-[18px]" />
              <span className="text-xs leading-[18px] tabular-nums">
                {post.commentCount}
              </span>
            </Link>
            <button
              type="button"
              onClick={toggleLike}
              className={`flex h-11 min-w-11 items-center gap-1.5 rounded-full px-2 hover:bg-red-50 ${liked ? "text-red-500" : ""}`}
              aria-pressed={liked}
              aria-label="좋아요"
            >
              <Heart
                className={`h-[18px] w-[18px] ${liked ? "fill-current" : ""}`}
              />
              <span className="text-xs leading-[18px] tabular-nums">
                {likeCount}
              </span>
            </button>
            <button
              type="button"
              onClick={toggleBookmark}
              className={`flex h-11 w-11 items-center justify-center rounded-full hover:bg-[var(--color-ds-primary-50)] ${bookmarked ? "text-[var(--color-ds-primary)]" : ""}`}
              aria-pressed={bookmarked}
              aria-label="즐겨찾기"
            >
              <Bookmark
                className={`h-[18px] w-[18px] ${bookmarked ? "fill-current" : ""}`}
              />
            </button>
            <button
              type="button"
              onClick={share}
              className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-navy-700"
              aria-label="공유"
            >
              <Share2 className="h-[18px] w-[18px]" />
            </button>
            <span
              className="flex h-11 items-center gap-1 px-2 text-xs leading-[18px] tabular-nums"
              aria-label={`조회수 ${post.viewCount}`}
            >
              <Eye className="h-[18px] w-[18px]" />
              {post.viewCount}
            </span>
          </div>
        </div>
      </div>
      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        targetType="POST"
        targetId={post.id}
      />
    </article>
  );
}
