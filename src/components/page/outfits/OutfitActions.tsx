"use client";
import { useQueryClient } from "@tanstack/react-query";
import { Bookmark, Heart, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { outfitJson, outfitRequest } from "@/lib/outfits/api";
import type { Outfit, OutfitViewerState } from "@/types/outfits";

import { useOutfitAuth } from "./OutfitAuth";
export default function OutfitActions({
  outfit,
  state,
  compact = false,
}: {
  outfit: Outfit;
  state?: OutfitViewerState;
  compact?: boolean;
}) {
  const requireLogin = useOutfitAuth();
  const { isAuthenticated } = useAuth();
  const statePending = isAuthenticated && !state;
  const cache = useQueryClient();
  const [liked, setLiked] = useState(state?.liked ?? false);
  const [bookmarked, setBookmarked] = useState(state?.bookmarked ?? false);
  const [count, setCount] = useState(outfit.likeCount);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setLiked(state?.liked ?? false);
    setBookmarked(state?.bookmarked ?? false);
    setCount(outfit.likeCount);
  }, [state?.liked, state?.bookmarked, outfit.likeCount]);
  const toggle = async (kind: "like" | "bookmark") => {
    if (busy || !requireLogin()) return;
    const previous = kind === "like" ? liked : bookmarked;
    setBusy(true);
    if (kind === "like") {
      setLiked(!previous);
      setCount((value) => value + (previous ? -1 : 1));
    } else setBookmarked(!previous);
    try {
      await outfitRequest(`/${outfit.id}/${kind}`, {
        method: previous ? "DELETE" : "PUT",
      });
      await cache.resetQueries({ queryKey: ["outfits", "feed"] });
      await cache.invalidateQueries({ queryKey: ["outfits"] });
    } catch {
      if (kind === "like") {
        setLiked(previous);
        setCount(outfit.likeCount);
      } else setBookmarked(previous);
      toast.error("반영하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  };
  const share = async () => {
    if (!requireLogin()) return;
    const url = `${window.location.origin}/outfits/${outfit.id}`;
    const nativeShare = typeof navigator.share === "function";
    const channel = nativeShare ? "NATIVE" : "CLIPBOARD";
    try {
      if (nativeShare)
        await navigator.share({
          title: `${outfit.author.nickname}의 의장`,
          url,
        });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("링크를 복사했어요.");
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError"))
        toast.error("공유하지 못했어요.");
      return;
    }
    const body = { requestId: crypto.randomUUID(), channel };
    try {
      await outfitRequest(`/${outfit.id}/shares`, outfitJson("POST", body));
    } catch {
      try {
        await outfitRequest(`/${outfit.id}/shares`, outfitJson("POST", body));
      } catch {
        toast.error("공유 기록을 반영하지 못했어요.");
      }
    }
  };
  return (
    <div
      className={
        compact
          ? "grid grid-cols-2 items-center gap-1 text-sm sm:flex sm:flex-wrap"
          : "flex flex-wrap items-center gap-1 text-sm"
      }
    >
      <button
        aria-label="좋아요"
        aria-pressed={liked}
        disabled={busy || statePending}
        onClick={() => void toggle("like")}
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-lg px-2 hover:bg-accent"
      >
        <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
        <span>{count}</span>
      </button>
      <Link
        href={`/outfits/${outfit.id}#comments`}
        aria-label={`댓글 ${outfit.commentCount}개`}
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-lg px-2 hover:bg-accent"
      >
        <MessageCircle className="h-4 w-4" />
        {outfit.commentCount}
      </Link>
      <button
        aria-label="즐겨찾기"
        aria-pressed={bookmarked}
        disabled={busy || statePending}
        onClick={() => void toggle("bookmark")}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-accent"
      >
        <Bookmark
          className="h-4 w-4"
          fill={bookmarked ? "currentColor" : "none"}
        />
      </button>
      <button
        aria-label="공유하기"
        onClick={() => void share()}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-accent"
      >
        <Share2 className="h-4 w-4" />
      </button>
    </div>
  );
}
