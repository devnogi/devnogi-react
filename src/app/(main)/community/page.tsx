import { notFound } from "next/navigation";

import { getPublicFeed } from "@/lib/community/public-feed";
import { PublicApiError } from "@/lib/seo/public-api";
import { createPageMetadata } from "@/lib/seo/site";

import CommunityClient from "./CommunityClient";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export const dynamic = "force-dynamic";

async function load(searchParams: Props["searchParams"]) {
  const query = await searchParams;
  const raw = query.page ?? "1";
  if (
    typeof raw !== "string" ||
    !/^[1-9]\d*$/.test(raw) ||
    !Number.isSafeInteger(Number(raw))
  )
    notFound();
  const page = Number(raw);
  const keyword = typeof query.q === "string" ? query.q : "";
  try {
    const initial = await getPublicFeed(page, keyword);
    if (page > 1 && initial.items.length === 0) notFound();
    return {
      initial,
      page,
      keyword,
      filtered: Object.keys(query).some((key) => key !== "page"),
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
  const { page, filtered } = await load(searchParams);
  return createPageMetadata({
    title: `마비노기 커뮤니티${page > 1 ? ` · ${page}페이지` : ""}`,
    description:
      "마비노기 플레이 경험과 질문, 경매장 이용 정보를 나누는 메모노기 커뮤니티입니다.",
    pathname: page > 1 ? `/community?page=${page}` : "/community",
    robots: { index: !filtered, follow: true },
  });
}

export default async function CommunityPage({ searchParams }: Props) {
  const { initial, page, keyword } = await load(searchParams);
  return (
    <CommunityClient
      key={`${page}:${keyword}`}
      initial={initial}
      startPage={page}
    />
  );
}
