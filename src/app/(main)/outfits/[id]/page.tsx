import type { Metadata } from "next";
import { notFound } from "next/navigation";

import OutfitDetail from "@/components/page/outfits/OutfitDetail";
import { getPublicOutfit } from "@/lib/outfits/public-outfit";
import { canonicalUrl } from "@/lib/seo/site";
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const outfit = await getPublicOutfit(Number(id));
  if (!outfit)
    return { title: "의장을 찾을 수 없어요", robots: { index: false } };
  const title = `${outfit.author.nickname}의 의장`;
  const description =
    outfit.content.slice(0, 150) || "마비노기에서 만나는 나만의 스타일";
  const images = outfit.images[0]
    ? [canonicalUrl(`/api/outfits/${outfit.id}/images/${outfit.images[0].id}`)]
    : [];
  return {
    title,
    description,
    alternates: { canonical: `/outfits/${id}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonicalUrl(`/outfits/${id}`),
      images,
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}
export default async function Page({ params }: Props) {
  const id = Number((await params).id);
  const outfit = await getPublicOutfit(id);
  if (!outfit) notFound();
  return <OutfitDetail id={id} initial={outfit} />;
}
