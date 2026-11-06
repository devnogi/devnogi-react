"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import type { PostSummary } from "@/hooks/useInfinitePosts";
import { clientAxios } from "@/lib/api/clients";
import { MEDIA_UPLOAD_TIMEOUT_MS } from "@/lib/api/timeouts";
import {
  ACCEPTED_MEDIA_TYPES,
  codePointLength,
  POST_CONTENT_LIMIT,
  sliceCodePoints,
  validateMediaFiles,
} from "@/lib/community/post-content";

interface Preview {
  file?: File;
  mediaId?: number;
  url: string;
  type: string;
  name: string;
}
interface PostComposerProps {
  autoFocus?: boolean;
  compact?: boolean;
  onPosted?: () => void;
  postId?: number;
  initialContent?: string;
  initialMedia?: PostSummary["media"];
  onCancel?: () => void;
}

export default function PostComposer({
  autoFocus = false,
  compact = false,
  onPosted,
  postId,
  initialContent = "",
  initialMedia = [],
  onCancel,
}: PostComposerProps) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const objectUrls = useRef(new Set<string>());
  const [content, setContent] = useState(initialContent);
  const [previews, setPreviews] = useState<Preview[]>(() =>
    initialMedia.map((media) => ({
      mediaId: media.id,
      url: media.url,
      type: media.contentType,
      name: `기존 미디어 ${media.displayOrder + 1}`,
    })),
  );
  const [submitting, setSubmitting] = useState(false);
  const length = codePointLength(content);

  useEffect(
    () => () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.current.clear();
    },
    [],
  );

  const selectFiles = (files: File[]) => {
    const error = validateMediaFiles([
      ...previews.flatMap(({ file }) => (file ? [file] : [])),
      ...files,
    ]);
    if (previews.length + files.length > 5)
      return toast.warning("미디어는 최대 5개까지 첨부할 수 있어요.");
    const videoCount =
      previews.filter(({ type }) => type.startsWith("video/")).length +
      files.filter((file) => file.type.startsWith("video/")).length;
    if (videoCount > 1)
      return toast.warning("영상은 한 개만 첨부할 수 있어요.");
    if (error) return toast.warning(error);
    setPreviews((current) => [
      ...current,
      ...files.map((file) => {
        const url = URL.createObjectURL(file);
        objectUrls.current.add(url);
        return { file, url, type: file.type, name: file.name };
      }),
    ]);
  };

  const remove = (index: number) =>
    setPreviews((current) => {
      const removed = current[index];
      if (removed.file) {
        URL.revokeObjectURL(removed.url);
        objectUrls.current.delete(removed.url);
      }
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  const move = (index: number, direction: -1 | 1) =>
    setPreviews((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      if (
        (current[index].mediaId === undefined) !==
        (current[target].mediaId === undefined)
      )
        return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const submit = async () => {
    if (!isAuthenticated)
      return toast.warning("로그인 후 글을 남길 수 있어요.");
    if (!content.trim()) return toast.warning("짧은 이야기라도 남겨주세요.");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append(
        "data",
        new Blob(
          [
            JSON.stringify({
              content: content.trim(),
              contentFormat: "PLAIN_TEXT_V1",
              isDraft: false,
              retainedMediaIds: previews.flatMap(({ mediaId }) =>
                mediaId === undefined ? [] : [mediaId],
              ),
            }),
          ],
          { type: "application/json" },
        ),
      );
      previews.forEach(({ file }) => {
        if (file) formData.append("media", file);
      });
      const uploadConfig = { timeout: MEDIA_UPLOAD_TIMEOUT_MS };
      if (postId)
        await clientAxios.patch(`/posts/${postId}`, formData, uploadConfig);
      else await clientAxios.post("/posts", formData, uploadConfig);
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.current.clear();
      setContent("");
      setPreviews([]);
      await queryClient.invalidateQueries({ queryKey: ["community-feed"] });
      await queryClient.invalidateQueries({ queryKey: ["post", postId] });
      toast.success(postId ? "게시글을 수정했어요." : "이야기를 올렸어요.");
      onPosted?.();
    } catch {
      toast.error(
        postId
          ? "게시글을 수정하지 못했어요."
          : "게시글을 올리지 못했어요. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="bg-white dark:bg-navy-800"
      aria-label={postId ? "게시글 수정" : "게시글 작성"}
    >
      <div className="flex gap-3 p-4 sm:p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {user?.profileImageUrl ? (
            <img
              className="h-full w-full object-cover"
              src={user.profileImageUrl}
              alt=""
            />
          ) : (
            (user?.nickname?.slice(0, 1) ?? "밀")
          )}
        </div>
        <div className="min-w-0 flex-1">
          <textarea
            autoFocus={autoFocus}
            value={content}
            rows={compact ? 2 : 5}
            onChange={(event) => {
              setContent(
                sliceCodePoints(event.target.value, POST_CONTENT_LIMIT),
              );
              const textarea = event.currentTarget;
              requestAnimationFrame(() => {
                textarea.style.height = "auto";
                textarea.style.height = `${Math.min(textarea.scrollHeight, compact ? 220 : 420)}px`;
              });
            }}
            placeholder="오늘 에린에서는 어떤 일이 있었나요?"
            className="min-h-16 w-full resize-none bg-transparent text-[15px] leading-6 text-gray-900 outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 dark:text-gray-100"
            aria-label="게시글 내용"
          />
          {previews.length > 0 && (
            <div className="mt-3 flex snap-x gap-2 overflow-x-auto pb-1">
              {previews.map((preview, index) => (
                <div
                  key={`${preview.mediaId ?? preview.name}-${preview.url}`}
                  className="relative h-32 w-32 shrink-0 snap-start overflow-hidden rounded-xl bg-gray-100 dark:bg-navy-700"
                >
                  {preview.type.startsWith("video/") ? (
                    <video
                      className="h-full w-full object-cover"
                      src={preview.url}
                      controls
                      preload="metadata"
                    />
                  ) : (
                    <img
                      className="h-full w-full object-cover"
                      src={preview.url}
                      alt={`${index + 1}번째 첨부 미리보기`}
                    />
                  )}
                  <div className="absolute inset-x-1 bottom-1 flex justify-between">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={
                        index === 0 ||
                        (previews[index].mediaId === undefined) !==
                          (previews[index - 1]?.mediaId === undefined)
                      }
                      aria-label={`${index + 1}번째 미디어 왼쪽으로 이동`}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-black/65 text-white disabled:opacity-35"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={
                        index === previews.length - 1 ||
                        (previews[index].mediaId === undefined) !==
                          (previews[index + 1]?.mediaId === undefined)
                      }
                      aria-label={`${index + 1}번째 미디어 오른쪽으로 이동`}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-black/65 text-white disabled:opacity-35"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label={`${index + 1}번째 미디어 삭제`}
                    className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full bg-black/65 text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-navy-600">
            <label
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-[var(--color-ds-primary)] hover:bg-[var(--color-ds-primary-50)]"
              aria-label="사진 또는 영상 첨부"
            >
              <ImagePlus className="h-5 w-5" />
              <input
                type="file"
                multiple
                className="sr-only"
                accept={ACCEPTED_MEDIA_TYPES.join(",")}
                onChange={(event) => {
                  selectFiles(Array.from(event.target.files ?? []));
                  event.target.value = "";
                }}
              />
            </label>
            <div className="flex items-center gap-3">
              {length >= 800 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {length}/{POST_CONTENT_LIMIT}
                </span>
              )}
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="h-11 rounded-full px-4 text-sm text-gray-600 dark:text-gray-300"
                >
                  취소
                </button>
              )}
              <button
                type="button"
                onClick={submit}
                disabled={submitting || !content.trim()}
                className="flex h-11 min-w-20 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-[var(--color-ds-primary-hover)] disabled:opacity-45"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : postId ? (
                  "수정"
                ) : (
                  "게시"
                )}
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            사진·영상 최대 5개 · 각 5MB 이하 · 영상 1개까지
          </p>
        </div>
      </div>
    </section>
  );
}
