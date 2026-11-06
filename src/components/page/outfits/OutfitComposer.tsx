"use client";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { outfitRequest } from "@/lib/outfits/api";
import {
  normalizeTags,
  validateOutfit,
  validatePhoto,
} from "@/lib/outfits/validation";
import { type Outfit, OUTFIT_SLOTS, type OutfitItem } from "@/types/outfits";

import ItemPicker from "./ItemPicker";
import { useOutfitAuth } from "./OutfitAuth";
type Photo = { key: string; url: string; imageId?: number; file?: File };
export default function OutfitComposer({ initial }: { initial?: Outfit }) {
  const { user, isLoading } = useAuth();
  const requireLogin = useOutfitAuth();
  const router = useRouter();
  const cache = useQueryClient();
  const [content, setContent] = useState(initial?.content ?? "");
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [items, setItems] = useState<OutfitItem[]>(initial?.items ?? []);
  const [photos, setPhotos] = useState<Photo[]>(
    initial?.images.map((image) => ({
      key: String(image.id),
      imageId: image.id,
      url: image.url,
    })) ?? [],
  );
  const objectUrls = useRef(new Set<string>());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!requireLogin()) return;
    const normalizedTags = normalizeTags(tags);
    const invalid = validateOutfit(
      content,
      normalizedTags,
      items,
      photos.length,
    );
    if (invalid) {
      setError(invalid);
      return;
    }
    setSaving(true);
    setError(null);
    const form = new FormData();
    let uploadIndex = 0;
    const mediaOrder = photos.map((photo) => {
      if (photo.file) {
        form.append("media", photo.file);
        return { uploadIndex: uploadIndex++ };
      }
      return { imageId: photo.imageId };
    });
    form.append(
      "data",
      new Blob(
        [JSON.stringify({ content, tags: normalizedTags, items, mediaOrder })],
        { type: "application/json" },
      ),
    );
    try {
      const saved = await outfitRequest<Outfit>(
        initial ? `/${initial.id}` : "",
        { method: initial ? "PUT" : "POST", body: form },
      );
      await cache.invalidateQueries({ queryKey: ["outfits"] });
      toast.success("의장을 저장했어요.");
      router.push(`/outfits/${saved.id}`);
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "저장하지 못했어요.",
      );
    } finally {
      setSaving(false);
    }
  };
  if (initial && !isLoading && user && user.userId !== initial.userId)
    return <p role="alert">본인이 작성한 의장만 수정할 수 있어요.</p>;
  return (
    <form
      onSubmit={submit}
      className="visual-polish mx-auto max-w-3xl space-y-8 py-6"
    >
      <div>
        <h1 className="text-2xl font-semibold">
          {initial ? "의장 수정" : "오늘의 의장 남기기"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          에린에서의 나만의 스타일을 보여 주세요. 의상, 손, 발은 꼭 선택해
          주세요.
        </p>
      </div>
      <fieldset disabled={saving} className="space-y-6">
        <legend className="mb-3 font-semibold">착용 사진 *</legend>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <div key={photo.key} className="w-40 shrink-0">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
                <Image
                  src={photo.url}
                  alt={`${index + 1}번째 착용 사진`}
                  fill
                  unoptimized
                  className="object-contain"
                  sizes="160px"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {index === 0 ? "대표 사진" : `${index + 1}번째 사진`}
              </p>
              <div className="flex">
                <button
                  type="button"
                  disabled={index === 0}
                  className="min-h-11 flex-1 text-sm disabled:opacity-40"
                  onClick={() =>
                    setPhotos((current) => [
                      current[index],
                      ...current.filter((_, i) => i !== index),
                    ])
                  }
                >
                  대표로
                </button>
                <button
                  type="button"
                  className="min-h-11 flex-1 text-sm"
                  aria-label={`${index + 1}번째 사진 삭제`}
                  onClick={() => {
                    if (photo.file) {
                      URL.revokeObjectURL(photo.url);
                      objectUrls.current.delete(photo.url);
                    }
                    setPhotos((current) =>
                      current.filter((entry) => entry.key !== photo.key),
                    );
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
        <label className="block">
          <span className="mb-2 block text-sm">
            사진 추가 (최대 5장 · 각 5MiB)
          </span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="block min-h-11 w-full text-sm file:mr-3 file:min-h-11 file:rounded-lg file:border-0 file:bg-secondary file:px-4 file:text-secondary-foreground"
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              event.target.value = "";
              if (photos.length + files.length > 5) {
                setError("사진은 최대 5장까지 등록할 수 있어요.");
                return;
              }
              const invalid = files.map(validatePhoto).find(Boolean);
              if (invalid) {
                setError(invalid);
                return;
              }
              setError(null);
              setPhotos((current) => [
                ...current,
                ...files.map((file) => {
                  const url = URL.createObjectURL(file);
                  objectUrls.current.add(url);
                  return { key: crypto.randomUUID(), file, url };
                }),
              ]);
            }}
          />
        </label>
      </fieldset>
      <fieldset disabled={saving}>
        <legend className="mb-4 font-semibold">착용 아이템</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          {OUTFIT_SLOTS.map(([slot, , required]) => (
            <ItemPicker
              key={slot}
              slot={slot}
              required={required}
              value={items.find((item) => item.slot === slot)}
              onChange={(item) =>
                setItems((current) => [
                  ...current.filter((entry) => entry.slot !== slot),
                  ...(item ? [item] : []),
                ])
              }
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          아이템은 목록에서 선택해 주세요. 모션만 직접 입력할 수 있어요.
        </p>
      </fieldset>
      <label className="block">
        <span className="mb-2 block font-semibold">이야기</span>
        <textarea
          value={content}
          disabled={saving}
          onChange={(event) => setContent(event.target.value)}
          rows={5}
          placeholder="오늘 의장에 담긴 이야기를 들려주세요."
          className="w-full rounded-lg border border-border bg-background p-3 text-sm leading-6"
        />
        <span className="block text-right text-xs text-muted-foreground">
          {[...content].length}/1,000
        </span>
      </label>
      <label className="block">
        <span className="mb-2 block font-semibold">태그</span>
        <input
          value={tags}
          disabled={saving}
          onChange={(event) => setTags(event.target.value)}
          placeholder="가을 코디, 일상, 모노톤"
          className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
        />
        <span className="mt-2 block text-xs text-muted-foreground">
          쉼표로 구분해 최대 10개, 각각 20자까지 입력해 주세요.
        </span>
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          disabled={saving}
          className="min-h-11 rounded-lg border border-border px-5"
          onClick={() => router.back()}
        >
          취소
        </button>
        <button
          type="submit"
          disabled={saving || isLoading}
          className="min-h-11 rounded-lg bg-primary px-5 text-primary-foreground disabled:opacity-50"
        >
          {saving ? "저장 중…" : "의장 저장"}
        </button>
      </div>
    </form>
  );
}
