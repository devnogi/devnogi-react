import { OUTFIT_SLOTS, type OutfitItem } from "@/types/outfits";
export function normalizeTags(value: string): string[] {
  return [
    ...new Set(
      value
        .split(",")
        .map((tag) => tag.trim().replace(/^#+/, "").normalize("NFC"))
        .filter(Boolean),
    ),
  ];
}
export function validateOutfit(
  content: string,
  tags: string[],
  items: OutfitItem[],
  imageCount: number,
): string | null {
  if (imageCount < 1 || imageCount > 5) return "사진을 1~5장 등록해 주세요.";
  if ([...content].length > 1000) return "본문은 1,000자까지 입력할 수 있어요.";
  if (tags.length > 10 || tags.some((tag) => [...tag].length > 20))
    return "태그는 10개까지, 각각 20자까지 입력해 주세요.";
  for (const [slot, label, required] of OUTFIT_SLOTS) {
    if (
      required &&
      !items.some((item) => item.slot === slot && item.name.trim())
    )
      return `${label} 아이템을 선택해 주세요.`;
  }
  if (new Set(items.map((item) => item.slot)).size !== items.length)
    return "같은 부위를 중복 등록할 수 없어요.";
  for (const item of items) {
    if (
      !item.name.trim() ||
      (item.inputType === "CUSTOM" &&
        (item.slot !== "MOTION" || [...item.name].length > 100))
    )
      return "직접 입력은 100자 이내의 모션에만 사용할 수 있어요.";
    if (
      item.inputType === "CATALOG" &&
      (!item.topCategory || !item.subCategory)
    )
      return "자동완성 목록에서 아이템을 선택해 주세요.";
  }
  return null;
}
export function validatePhoto(file: File): string | null {
  if (
    !/\.(jpe?g|png|webp|gif)$/i.test(file.name) ||
    !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)
  )
    return "JPEG, PNG, WebP, GIF 사진만 등록할 수 있어요.";
  if (file.size === 0 || file.size > 5 * 1024 * 1024)
    return "사진은 파일당 5MiB 이하로 등록해 주세요.";
  return null;
}
