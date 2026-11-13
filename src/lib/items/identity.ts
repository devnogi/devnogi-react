export interface ItemIdentity {
  name: string;
  topCategory: string;
  subCategory: string;
}

const MAX_KEY_LENGTH = 8192;

function validPart(value: unknown, maxLength: number): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    [...value].length <= maxLength &&
    ![...value].some(
      (character) =>
        character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
    ) &&
    new TextDecoder().decode(new TextEncoder().encode(value)) === value
  );
}

export function encodeItemKey(item: ItemIdentity): string {
  const parts = [item.topCategory, item.subCategory, item.name];
  if (!parts.every((part, index) => validPart(part, index < 2 ? 25 : 255)))
    throw new Error("유효하지 않은 아이템 식별자");
  const bytes = new TextEncoder().encode(JSON.stringify(parts));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeItemKey(key: string): ItemIdentity | null {
  if (
    !key ||
    key.length > MAX_KEY_LENGTH ||
    !/^[A-Za-z0-9_-]+={0,2}$/.test(key)
  )
    return null;
  try {
    const bytes = Uint8Array.from(
      atob(key.replace(/-/g, "+").replace(/_/g, "/")),
      (character) => character.charCodeAt(0),
    );
    const parts: unknown = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(bytes),
    );
    if (
      !Array.isArray(parts) ||
      parts.length !== 3 ||
      !parts.every((part, index) => validPart(part, index < 2 ? 25 : 255))
    )
      return null;
    return { topCategory: parts[0], subCategory: parts[1], name: parts[2] };
  } catch {
    return null;
  }
}

export function itemPath(item: ItemIdentity): string {
  return `/items/${encodeItemKey(item)}`;
}
