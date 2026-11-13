import { cache } from "react";

import { selectServerGatewayUrl } from "@/lib/api/gateway-selector";
import type { Outfit } from "@/types/outfits";

import { publicOutfit } from "./seo";
export const getPublicOutfit = cache(
  async (id: number): Promise<Outfit | null> => {
    if (!Number.isSafeInteger(id) || id < 1) return null;
    const response = await fetch(
      new URL(`/dcs/api/outfits/${id}`, selectServerGatewayUrl()),
      { cache: "no-store", signal: AbortSignal.timeout(10000) },
    );
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("의장을 불러오지 못했어요.");
    const payload = await response.json();
    if (!payload.success || !payload.data)
      throw new Error("의장을 불러오지 못했어요.");
    return publicOutfit(payload.data);
  },
);
