"use client";
import { useInfiniteQuery, useQueries } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import ActivityGradeBadge from "@/components/ui/ActivityGradeBadge";
import { useAuth } from "@/contexts/AuthContext";
import { outfitRequest } from "@/lib/outfits/api";
import { outfitTitle } from "@/lib/outfits/seo";
import type {
  Outfit,
  OutfitItem,
  OutfitPage,
  OutfitViewerState,
} from "@/types/outfits";

import OutfitActions from "./OutfitActions";
import { OutfitAuth, useOutfitAuth } from "./OutfitAuth";
import OutfitFilters from "./OutfitFilters";
export default function OutfitFeed({
  personal = false,
  initial,
  initialCursor = "",
}: {
  personal?: boolean;
  initial?: OutfitPage<Outfit>;
  initialCursor?: string;
}) {
  return (
    <OutfitAuth>
      <Feed
        personal={personal}
        initial={initial}
        initialCursor={initialCursor}
      />
    </OutfitAuth>
  );
}
function Feed({
  personal,
  initial,
  initialCursor,
}: {
  personal: boolean;
  initial?: OutfitPage<Outfit>;
  initialCursor: string;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const requireLogin = useOutfitAuth();
  const [personalTab, setPersonalTab] = useState("mine");
  const sort = params.get("sort") === "POPULAR" ? "POPULAR" : "LATEST";
  const filterQuery = new URLSearchParams();
  if (params.has("items")) filterQuery.set("items", params.get("items")!);
  for (const tag of params.getAll("tags")) filterQuery.append("tags", tag);
  if (params.has("motion")) filterQuery.set("motion", params.get("motion")!);
  const queryString = filterQuery.toString();
  const feed = useInfiniteQuery({
    queryKey: [
      "outfits",
      "feed",
      personal ? personalTab : "public",
      personal ? user?.userId : null,
      sort,
      queryString,
      initialCursor,
    ],
    initialPageParam: { page: 0, cursor: initialCursor },
    initialData:
      !personal && initial
        ? { pages: [initial], pageParams: [{ page: 0, cursor: initialCursor }] }
        : undefined,
    queryFn: ({ pageParam, signal }) => {
      const query = new URLSearchParams(queryString);
      query.set("sort", sort);
      query.set("size", "24");
      query.set("page", String(pageParam.page));
      if (pageParam.cursor) query.set("cursor", pageParam.cursor);
      return outfitRequest<OutfitPage<Outfit>>(
        `${personal ? `/${personalTab === "mine" ? "mine" : "bookmarks"}` : ""}?${query}`,
        { signal },
      );
    },
    getNextPageParam: (last, all) =>
      last.hasNext
        ? { page: all.length, cursor: last.nextCursor ?? "" }
        : undefined,
    enabled: !personal || (!isLoading && isAuthenticated),
  });
  const outfits = [
    ...new Map(
      (feed.data?.pages.flatMap((page) => page.content) ?? []).map((outfit) => [
        outfit.id,
        outfit,
      ]),
    ).values(),
  ];
  const batches = Array.from(
    { length: Math.ceil(outfits.length / 50) },
    (_, index) =>
      outfits
        .slice(index * 50, (index + 1) * 50)
        .map((outfit) => outfit.id)
        .join(","),
  );
  const viewerQueries = useQueries({
    queries: batches.map((ids) => ({
      queryKey: ["outfits", "viewer", user?.userId, ids],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        outfitRequest<OutfitViewerState[]>(`/viewer-state?ids=${ids}`, {
          signal,
        }),
      enabled: isAuthenticated && !!ids,
    })),
  });
  const states = viewerQueries.flatMap((query) => query.data ?? []);
  const updateFilters = (items: OutfitItem[], tags: string[]) => {
    const query = new URLSearchParams();
    query.set("sort", sort);
    if (items.length) query.set("items", JSON.stringify(items));
    tags.forEach((tag) => query.append("tags", tag));
    router.push(`${pathname}?${query}`);
  };
  return (
    <section className="visual-polish mx-auto max-w-[1120px] space-y-6 py-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {personal ? "의장 게시글" : "마비노기 의장·코디 모음"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {personal
              ? "내가 남기고 모아 둔 에린의 스타일"
              : "에린에서 만나는 나만의 스타일"}
          </p>
        </div>
        <button
          className="min-h-11 shrink-0 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
          onClick={() => {
            if (requireLogin()) router.push("/outfits/write");
          }}
        >
          의장 올리기
        </button>
      </header>
      <div className="flex gap-2 border-b border-border" aria-label="의장 목록">
        {(personal
          ? [
              ["mine", "내 의장"],
              ["bookmarks", "즐겨찾기"],
            ]
          : [
              ["LATEST", "최신순"],
              ["POPULAR", "인기순"],
            ]
        ).map(([key, label]) => (
          <button
            key={key}
            aria-pressed={(personal ? personalTab : sort) === key}
            className={`min-h-11 px-4 text-sm font-medium ${(personal ? personalTab : sort) === key ? "border-b-2 border-primary" : "text-muted-foreground"}`}
            onClick={() => {
              if (personal) setPersonalTab(key);
              else {
                const next = new URLSearchParams(params.toString());
                next.set("sort", key);
                next.delete("cursor");
                router.push(`${pathname}?${next}`);
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {!personal && (
        <OutfitFilters
          key={queryString}
          search={queryString}
          onApply={updateFilters}
        />
      )}
      {!personal && sort === "POPULAR" && (
        <p className="text-xs text-muted-foreground">
          최근 7일 게시글을 좋아요 순으로 보여 드려요. 반응에 따라 순서가 달라질
          수 있어요.
        </p>
      )}
      {personal && !isLoading && !isAuthenticated ? (
        <button className="min-h-11" onClick={requireLogin}>
          로그인하고 내 의장 보기
        </button>
      ) : feed.isPending ? (
        <div
          role="status"
          aria-label="의장 불러오는 중"
          className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
        >
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="aspect-[3/4] animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      ) : feed.isError ? (
        <div role="alert" className="py-12 text-center">
          <p>의장을 불러오지 못했어요.</p>
          <button
            className="mt-3 min-h-11 rounded-lg border px-4"
            onClick={() => void feed.refetch()}
          >
            다시 시도
          </button>
        </div>
      ) : outfits.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-medium">
            {personal
              ? "아직 모아 둔 의장이 없어요."
              : "아직 일치하는 의장이 없어요."}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {personal
              ? "나만의 의장을 남기거나 마음에 드는 스타일을 저장해 보세요."
              : "검색 조건을 바꾸거나 첫 번째 의장을 남겨 보세요."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-4">
          {outfits.map((outfit) => (
            <article key={outfit.id} className="min-w-0">
              <Link
                href={`/outfits/${outfit.id}`}
                className="relative block aspect-[3/4] overflow-hidden rounded-xl bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                aria-label={`${outfit.author.nickname}의 의장 보기`}
              >
                {outfit.images[0] && (
                  <Image
                    src={`/api/outfits/${outfit.id}/images/${outfit.images[0].id}`}
                    alt={`${outfitTitle(outfit)} 착용 사진`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 280px"
                  />
                )}
                {outfit.images.length > 1 && (
                  <span className="absolute bottom-2 right-2 rounded bg-background/90 px-2 py-1 text-xs">
                    {outfit.images.length}장
                  </span>
                )}
              </Link>
              <h2 className="mt-3 text-sm font-semibold">
                <Link href={`/outfits/${outfit.id}`}>
                  {outfitTitle(outfit)}
                </Link>
              </h2>
              {outfit.content && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {outfit.content}
                </p>
              )}
              <Link
                href={`/profile/${outfit.userId}`}
                className="mt-2 flex min-h-11 flex-wrap items-center gap-2 text-sm font-semibold"
              >
                <span className="truncate">{outfit.author.nickname}</span>
                <ActivityGradeBadge
                  grade={outfit.author.activityGrade}
                  verified={outfit.author.verified}
                />
              </Link>
              <OutfitActions
                compact
                outfit={outfit}
                state={
                  isAuthenticated
                    ? states.find((state) => state.outfitId === outfit.id)
                    : undefined
                }
              />
            </article>
          ))}
        </div>
      )}
      {!personal && sort === "LATEST" && !queryString && (
        <nav
          aria-label="의장 페이지 이동"
          className="flex justify-center gap-6 text-sm"
        >
          {initialCursor && (
            <Link className="inline-flex min-h-11 items-center" href="/outfits">
              처음으로
            </Link>
          )}
          {feed.hasNextPage && feed.data?.pages.at(-1)?.nextCursor && (
            <Link
              className="inline-flex min-h-11 items-center"
              href={`/outfits?${new URLSearchParams({ cursor: feed.data.pages.at(-1)!.nextCursor! })}`}
            >
              다음 페이지
            </Link>
          )}
        </nav>
      )}
      {feed.hasNextPage && (
        <div className="text-center">
          <button
            disabled={feed.isFetchingNextPage}
            className="min-h-11 rounded-lg border border-border px-6 disabled:opacity-50"
            onClick={() => void feed.fetchNextPage()}
          >
            {feed.isFetchingNextPage ? "불러오는 중…" : "더 보기"}
          </button>
        </div>
      )}
    </section>
  );
}
