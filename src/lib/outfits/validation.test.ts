import type { OutfitItem } from "@/types/outfits";

import { normalizeTags, validateOutfit, validatePhoto } from "./validation";
const required: OutfitItem[] = ["CLOTHING", "HANDS", "FEET"].map((slot) => ({
  slot: slot as OutfitItem["slot"],
  name: "아이템",
  inputType: "CATALOG",
  topCategory: "분류",
  subCategory: "하위",
}));
it("requires clothing, gloves and shoes independently, but permits empty text", () => {
  expect(validateOutfit("", [], required, 1)).toBeNull();
  for (const item of required)
    expect(
      validateOutfit(
        "",
        [],
        required.filter((entry) => entry !== item),
        1,
      ),
    ).toContain("선택");
  expect(validateOutfit("", [], required, 0)).toContain("사진");
  expect(validateOutfit("", [], required, 6)).toContain("사진");
});
it("permits custom motion only and preserves two accessory slots", () => {
  const motion: OutfitItem = {
    slot: "MOTION",
    name: "의상 전용 모션",
    inputType: "CUSTOM",
  };
  expect(validateOutfit("", [], [...required, motion], 1)).toBeNull();
  expect(
    validateOutfit("", [], [...required, { ...motion, slot: "HEAD" }], 1),
  ).toContain("모션");
  expect(
    validateOutfit(
      "",
      [],
      [
        ...required,
        { ...required[0], slot: "ACCESSORY_1" },
        { ...required[0], slot: "ACCESSORY_2" },
      ],
      1,
    ),
  ).toBeNull();
  expect(validateOutfit("", [], [...required, required[0]], 1)).toContain(
    "중복",
  );
});
it("counts Unicode characters and rejects excessive tags and non-photo uploads", () => {
  expect(validateOutfit("😀".repeat(1000), [], required, 1)).toBeNull();
  expect(validateOutfit("😀".repeat(1001), [], required, 1)).toContain("1,000");
  expect(normalizeTags(" #겨울, 겨울, #모노톤 ")).toEqual(["겨울", "모노톤"]);
  expect(validateOutfit("", ["가".repeat(21)], required, 1)).toContain("태그");
  expect(
    validatePhoto(new File(["x"], "movie.mp4", { type: "video/mp4" })),
  ).not.toBeNull();
  expect(
    validatePhoto(new File(["x"], "photo.png", { type: "image/png" })),
  ).toBeNull();
  expect(
    validatePhoto(new File([], "empty.png", { type: "image/png" })),
  ).not.toBeNull();
});
