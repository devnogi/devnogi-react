import { cache } from "react";

import { PublicApiError, publicJson } from "@/lib/seo/public-api";
import type { Outfit, OutfitPage } from "@/types/outfits";

import { publicOutfit } from "./seo";

export const getPublicOutfits = cache(async (query: string) => {
  const params = new URLSearchParams(query);
  params.set("size", "24");
  if (!params.has("sort")) params.set("sort", "LATEST");
  const data = await publicJson<OutfitPage<Outfit>>(
    `/dcs/api/outfits?${params}`,
  );
  if (
    !Array.isArray(data?.content) ||
    typeof data.hasNext !== "boolean" ||
    (data.hasNext &&
      typeof data.nextCursor !== "string" &&
      params.get("sort") !== "POPULAR")
  ) {
    throw new PublicApiError(502);
  }
  return { ...data, content: data.content.map(publicOutfit) };
});
