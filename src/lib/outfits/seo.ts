import { normalizeExcerpt } from "@/lib/community/post-content";
import type { Outfit } from "@/types/outfits";

export function outfitTitle(outfit: Outfit): string {
  const clothing = outfit.items.find((item) => item.slot === "CLOTHING");
  return clothing?.name
    ? `${clothing.name} 코디`
    : normalizeExcerpt(outfit.content, 60) ||
        `${outfit.author.nickname}의 의장 #${outfit.id}`;
}

export function publicOutfit(outfit: Outfit): Outfit {
  return {
    ...outfit,
    images: outfit.images.map(({ id, displayOrder }) => ({
      id,
      displayOrder,
      url: `/api/outfits/${outfit.id}/images/${id}`,
    })),
  };
}
