import type { Metadata } from "next";
import { notFound } from "next/navigation";

import OutfitDetail from "@/components/page/outfits/OutfitDetail";
import { getPublicOutfit } from "@/lib/outfits/public-outfit";
import { outfitTitle } from "@/lib/outfits/seo";
import { canonicalUrl } from "@/lib/seo/site";
import { breadcrumbs, jsonLd } from "@/lib/seo/structured-data";
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const outfit = await getPublicOutfit(Number(id));
  if (!outfit) notFound();
  const title = outfitTitle(outfit);
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
  const path = `/outfits/${id}`;
  const title = outfitTitle(outfit);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "DiscussionForumPosting",
            headline: title,
            text: outfit.content,
            image: outfit.images.map((image) => canonicalUrl(image.url)),
            datePublished: outfit.createdAt,
            dateModified: outfit.updatedAt,
            author: {
              "@type": "Person",
              name: outfit.author.nickname,
              url: canonicalUrl(`/profile/${outfit.userId}`),
            },
            mainEntityOfPage: canonicalUrl(path),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbs([
              { name: "마비노기 의장·코디", path: "/outfits" },
              { name: title, path },
            ]),
          ),
        }}
      />
      <OutfitDetail id={id} initial={outfit} />
    </>
  );
}
