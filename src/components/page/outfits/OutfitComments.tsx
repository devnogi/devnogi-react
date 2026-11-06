"use client";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { outfitJson, outfitRequest } from "@/lib/outfits/api";
import type { OutfitComment, OutfitPage } from "@/types/outfits";

import { useOutfitAuth } from "./OutfitAuth";
function CommentForm({
  outfitId,
  parentId,
  initial,
  onDone,
}: {
  outfitId: number;
  parentId?: number;
  initial?: OutfitComment;
  onDone?: () => void;
}) {
  const [text, setText] = useState(initial?.content ?? "");
  const [busy, setBusy] = useState(false);
  const requireLogin = useOutfitAuth();
  const cache = useQueryClient();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!requireLogin() || busy) return;
    if (!text.trim() || [...text].length > 1000) {
      toast.error("댓글은 1~1,000자로 입력해 주세요.");
      return;
    }
    setBusy(true);
    try {
      await outfitRequest(
        `/${outfitId}/comments${initial ? `/${initial.id}` : ""}`,
        outfitJson(initial ? "PUT" : "POST", {
          content: text,
          ...(parentId ? { parentId } : {}),
        }),
      );
      setText("");
      await cache.resetQueries({ queryKey: ["outfits", "feed"] });
      await cache.invalidateQueries({ queryKey: ["outfits"] });
      onDone?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "댓글을 저장하지 못했어요.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        aria-label={
          initial ? "댓글 수정" : parentId ? "답글 내용" : "댓글 내용"
        }
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={2}
        placeholder="따뜻한 한마디를 남겨 주세요."
        className="w-full rounded-lg border border-border bg-background p-3 text-sm"
        disabled={busy}
      />
      <div className="flex justify-end gap-2">
        {onDone && (
          <button
            type="button"
            className="min-h-11 px-3 text-sm"
            onClick={onDone}
          >
            취소
          </button>
        )}
        <button
          disabled={busy}
          className="min-h-11 rounded-lg bg-primary px-4 text-sm text-primary-foreground"
        >
          {busy ? "저장 중…" : initial ? "수정 저장" : "댓글 등록"}
        </button>
      </div>
    </form>
  );
}
function CommentRow({
  outfitId,
  comment,
}: {
  outfitId: number;
  comment: OutfitComment;
}) {
  const { user } = useAuth();
  const requireLogin = useOutfitAuth();
  const cache = useQueryClient();
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [removing, setRemoving] = useState(false);
  const remove = async () => {
    if (!requireLogin() || !window.confirm("댓글을 삭제할까요?")) return;
    setRemoving(true);
    try {
      await outfitRequest(`/${outfitId}/comments/${comment.id}`, {
        method: "DELETE",
      });
      await cache.resetQueries({ queryKey: ["outfits", "feed"] });
      await cache.invalidateQueries({ queryKey: ["outfits"] });
    } catch {
      toast.error("댓글을 삭제하지 못했어요.");
    } finally {
      setRemoving(false);
    }
  };
  return (
    <article className="border-b border-border py-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {!comment.deleted && (
          <Link
            href={`/profile/${comment.userId}`}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-foreground"
          >
            {comment.author.nickname}
          </Link>
        )}
        <time dateTime={comment.createdAt}>
          {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
        </time>
      </div>
      {editing ? (
        <CommentForm
          outfitId={outfitId}
          initial={comment}
          onDone={() => setEditing(false)}
        />
      ) : (
        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {comment.deleted ? "삭제된 댓글입니다." : comment.content}
        </p>
      )}
      <div className="flex gap-2 text-xs">
        {!comment.deleted && !comment.parentId && (
          <button
            className="min-h-11 px-2"
            onClick={() => {
              if (requireLogin()) setReplying((value) => !value);
            }}
          >
            답글
          </button>
        )}
        {!comment.deleted && user?.userId === comment.userId && (
          <>
            <button className="min-h-11 px-2" onClick={() => setEditing(true)}>
              수정
            </button>
            <button
              disabled={removing}
              className="min-h-11 px-2"
              onClick={() => void remove()}
            >
              삭제
            </button>
          </>
        )}
        {!comment.parentId && comment.replyCount > 0 && (
          <button
            className="min-h-11 px-2"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "답글 접기" : `답글 ${comment.replyCount}개 보기`}
          </button>
        )}
      </div>
      {replying && (
        <CommentForm
          outfitId={outfitId}
          parentId={comment.id}
          onDone={() => {
            setReplying(false);
            setExpanded(true);
          }}
        />
      )}
      {expanded && (
        <div className="border-l border-border pl-4">
          <CommentList outfitId={outfitId} parentId={comment.id} />
        </div>
      )}
    </article>
  );
}
function CommentList({
  outfitId,
  parentId,
}: {
  outfitId: number;
  parentId?: number;
}) {
  const query = useInfiniteQuery({
    queryKey: ["outfits", "comments", outfitId, parentId],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      outfitRequest<OutfitPage<OutfitComment>>(
        `/${outfitId}/comments?page=${pageParam}&size=20${parentId ? `&parentId=${parentId}` : ""}`,
        { signal },
      ),
    getNextPageParam: (last, pages) =>
      last.hasNext ? pages.length : undefined,
  });
  if (query.isPending)
    return (
      <p role="status" className="py-4 text-sm">
        댓글을 불러오고 있어요.
      </p>
    );
  if (query.isError)
    return (
      <button className="min-h-11 text-sm" onClick={() => void query.refetch()}>
        댓글을 불러오지 못했어요. 다시 시도
      </button>
    );
  const comments = [
    ...new Map(
      query.data.pages
        .flatMap((page) => page.content)
        .map((comment) => [comment.id, comment]),
    ).values(),
  ];
  return (
    <>
      {comments.map((comment) => (
        <CommentRow key={comment.id} outfitId={outfitId} comment={comment} />
      ))}
      {comments.length === 0 && (
        <p className="py-6 text-sm text-muted-foreground">
          첫 댓글을 남겨 보세요.
        </p>
      )}
      {query.hasNextPage && (
        <button
          disabled={query.isFetchingNextPage}
          className="min-h-11 w-full text-sm"
          onClick={() => void query.fetchNextPage()}
        >
          댓글 더 보기
        </button>
      )}
    </>
  );
}
export default function OutfitComments({ outfitId }: { outfitId: number }) {
  return (
    <section
      id="comments"
      className="mt-8 scroll-mt-32 border-t border-border pt-6"
    >
      <h2 className="mb-4 text-lg font-semibold">댓글</h2>
      <CommentForm outfitId={outfitId} />
      <CommentList outfitId={outfitId} />
    </section>
  );
}
