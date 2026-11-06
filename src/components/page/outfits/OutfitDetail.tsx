"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import ServerCodeBadge from "@/components/ui/ServerCodeBadge";
import { useAuth } from "@/contexts/AuthContext";
import { outfitRequest } from "@/lib/outfits/api";
import {
  type Outfit,
  type OutfitViewerState,
  slotLabel,
} from "@/types/outfits";

import OutfitActions from "./OutfitActions";
import { OutfitAuth } from "./OutfitAuth";
import OutfitComments from "./OutfitComments";
import OutfitComposer from "./OutfitComposer";
export default function OutfitDetail({
  id,
  initial,
  editing = false,
}: {
  id: number;
  initial?: Outfit;
  editing?: boolean;
}) {
  return (
    <OutfitAuth>
      <Detail id={id} initial={initial} editing={editing} />
    </OutfitAuth>
  );
}
function Detail({
  id,
  initial,
  editing,
}: {
  id: number;
  initial?: Outfit;
  editing: boolean;
}) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const cache = useQueryClient();
  const [photo, setPhoto] = useState(0);
  const [removing, setRemoving] = useState(false);
  const query = useQuery({
    queryKey: ["outfits", "detail", id],
    queryFn: ({ signal }) => outfitRequest<Outfit>(`/${id}`, { signal }),
    initialData: initial,
  });
  const state = useQuery({
    queryKey: ["outfits", "viewer", user?.userId, String(id)],
    queryFn: ({ signal }) =>
      outfitRequest<OutfitViewerState[]>(`/viewer-state?ids=${id}`, { signal }),
    enabled: isAuthenticated,
  });
  if (query.isPending)
    return (
      <p role="status" className="py-16 text-center">
        의장을 불러오고 있어요.
      </p>
    );
  if (query.isError || !query.data)
    return (
      <div role="alert" className="py-16 text-center">
        <p>의장을 불러오지 못했어요.</p>
        <button className="min-h-11 px-4" onClick={() => void query.refetch()}>
          다시 시도
        </button>
        <Link
          href="/outfits"
          className="inline-flex min-h-11 items-center px-4"
        >
          목록으로
        </Link>
      </div>
    );
  const outfit = query.data;
  if (editing) return <OutfitComposer initial={outfit} />;
  const image = outfit.images[Math.min(photo, outfit.images.length - 1)];
  const remove = async () => {
    if (!window.confirm("의장을 삭제할까요?")) return;
    setRemoving(true);
    try {
      await outfitRequest(`/${id}`, { method: "DELETE" });
      await cache.invalidateQueries({ queryKey: ["outfits"] });
      router.push("/outfits");
    } catch {
      toast.error("삭제하지 못했어요.");
      setRemoving(false);
    }
  };
  return (
    <article className="visual-polish mx-auto max-w-[1120px] py-6">
      <Link
        href="/outfits"
        className="mb-4 inline-flex min-h-11 items-center text-sm"
      >
        ← 의장 둘러보기
      </Link>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
            {image && (
              <Image
                src={`/api/outfits/${outfit.id}/images/${image.id}`}
                alt={`${outfit.author.nickname}의 의장 사진 ${photo + 1}`}
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 640px"
                className="object-contain"
              />
            )}
          </div>
          {outfit.images.length > 1 && (
            <div className="mt-3 flex justify-center gap-2">
              {outfit.images.map((entry, index) => (
                <button
                  key={entry.id}
                  aria-label={`${index + 1}번째 사진 보기`}
                  aria-pressed={photo === index}
                  className={`min-h-11 min-w-11 rounded-lg border ${photo === index ? "border-primary bg-secondary" : "border-border"}`}
                  onClick={() => setPhoto(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <header className="flex items-start justify-between gap-3">
            <div>
              <Link
                href={`/profile/${outfit.userId}`}
                className="inline-flex min-h-11 items-center gap-2 font-semibold"
              >
                {outfit.author.nickname}
                <ServerCodeBadge
                  serverName={outfit.author.serverName}
                  verified={outfit.author.verified}
                />
              </Link>
              <p className="text-xs text-muted-foreground">
                <time dateTime={outfit.createdAt}>
                  {new Date(outfit.createdAt).toLocaleDateString("ko-KR")}
                </time>
              </p>
            </div>
            {user?.userId === outfit.userId && (
              <div className="flex text-sm">
                <Link
                  href={`/outfits/${id}/edit`}
                  className="inline-flex min-h-11 items-center px-3"
                >
                  수정
                </Link>
                <button
                  disabled={removing}
                  onClick={() => void remove()}
                  className="min-h-11 px-3"
                >
                  삭제
                </button>
              </div>
            )}
          </header>
          {outfit.content && (
            <p className="mt-6 whitespace-pre-wrap break-words text-[15px] leading-6">
              {outfit.content}
            </p>
          )}
          <div className="my-4 flex flex-wrap gap-2">
            {outfit.tags.map((tag) => (
              <Link
                key={tag}
                href={`/outfits?${new URLSearchParams({ tags: tag })}`}
                className="inline-flex min-h-11 items-center rounded-lg bg-secondary px-3 text-sm"
              >
                #{tag}
              </Link>
            ))}
          </div>
          <OutfitActions
            outfit={outfit}
            state={isAuthenticated ? state.data?.[0] : undefined}
          />
          <section className="mt-6 border-t border-border pt-5">
            <h1 className="mb-3 text-lg font-semibold">착용 아이템</h1>
            <dl className="divide-y divide-border">
              {outfit.items.map((item) => (
                <div
                  key={item.slot}
                  className="grid grid-cols-[90px_minmax(0,1fr)] items-start gap-3 py-2"
                >
                  <dt className="py-3 text-xs text-muted-foreground">
                    {slotLabel(item.slot)}
                  </dt>
                  <dd>
                    <Link
                      href={`/outfits?${new URLSearchParams({ items: JSON.stringify([item]) })}`}
                      className="inline-flex min-h-11 items-center break-words text-sm font-medium"
                    >
                      {item.name}
                    </Link>
                    {item.inputType === "CUSTOM" && (
                      <p className="text-xs text-muted-foreground">
                        직접 입력한 모션
                      </p>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
      <div className="mx-auto max-w-3xl">
        <OutfitComments outfitId={id} />
      </div>
    </article>
  );
}
