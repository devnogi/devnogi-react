import { notFound } from "next/navigation";
import { Suspense } from "react";

import OutfitFeed from "@/components/page/outfits/OutfitFeed";
import { getPublicOutfits } from "@/lib/outfits/public-feed";
import { PublicApiError } from "@/lib/seo/public-api";
import { createPageMetadata } from "@/lib/seo/site";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export const dynamic = "force-dynamic";

async function load(searchParams: Props["searchParams"]) {
  const query = await searchParams;
  const params = new URLSearchParams();
  for (const key of ["sort", "cursor", "items", "tags", "motion"]) {
    const value = query[key];
    for (const entry of Array.isArray(value) ? value : value ? [value] : [])
      params.append(key, entry);
  }
  const cursor = params.get("cursor") ?? "";
  if (cursor.length > 1024) notFound();
  try {
    const initial = await getPublicOutfits(params.toString());
    if (cursor && initial.content.length === 0) notFound();
    return {
      initial,
      cursor,
      query: params.toString(),
      filtered: Object.keys(query).some(
        (key) =>
          key !== "cursor" && !(key === "sort" && query.sort === "LATEST"),
      ),
    };
  } catch (error) {
    if (
      error instanceof PublicApiError &&
      (error.status === 400 || error.status === 404)
    )
      notFound();
    throw error;
  }
}

export async function generateMetadata({ searchParams }: Props) {
  const { cursor, filtered } = await load(searchParams);
  return createPageMetadata({
    title: "마비노기 의장·코디 모음",
    description:
      "마비노기 의장 사진과 착용 아이템을 둘러보고, 나만의 코디와 스타일을 공유하세요.",
    pathname:
      cursor && !filtered
        ? `/outfits?${new URLSearchParams({ cursor })}`
        : "/outfits",
    robots: { index: !filtered, follow: true },
  });
}

export default async function Page({ searchParams }: Props) {
  const { initial, cursor, query } = await load(searchParams);
  return (
    <Suspense>
      <OutfitFeed key={query} initial={initial} initialCursor={cursor} />
    </Suspense>
  );
}
