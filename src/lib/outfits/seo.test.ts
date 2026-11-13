import type { Outfit } from "@/types/outfits";

import { outfitTitle, publicOutfit } from "./seo";

const outfit = {
  id: 3,
  author: { nickname: "작성자" },
  content: "봄 코디",
  items: [{ slot: "CLOTHING", name: "시크 스타일 의상(남성용)" }],
  images: [
    {
      id: 16,
      displayOrder: 0,
      url: "https://storage.example.test/picture?X-Amz-Signature=synthetic",
    },
  ],
} as Outfit;

it("uses outfit content rather than duplicate nickname titles", () => {
  expect(outfitTitle(outfit)).toBe("시크 스타일 의상(남성용) 코디");
  expect(outfitTitle({ ...outfit, items: [] })).toBe("봄 코디");
  expect(outfitTitle({ ...outfit, items: [], content: "" })).toBe(
    "작성자의 의장 #3",
  );
});
it("serializes stable public image proxies instead of storage signatures", () => {
  const initial = publicOutfit(outfit);
  expect(initial.images[0].url).toBe("/api/outfits/3/images/16");
  expect(JSON.stringify(initial)).not.toContain("X-Amz-");
  expect(outfit.images[0].url).toContain("X-Amz-");
});
