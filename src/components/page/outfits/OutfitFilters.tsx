"use client";
import { useState } from "react";

import { normalizeTags } from "@/lib/outfits/validation";
import { OUTFIT_SLOTS, type OutfitItem } from "@/types/outfits";

import ItemPicker from "./ItemPicker";
function readOutfitFilters(params: URLSearchParams): OutfitItem[] {
  try {
    const parsed: unknown = JSON.parse(params.get("items") ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is OutfitItem =>
        !!item &&
        typeof item === "object" &&
        typeof item.name === "string" &&
        OUTFIT_SLOTS.some(([slot]) => slot === item.slot) &&
        ["CATALOG", "CUSTOM"].includes(item.inputType),
    );
  } catch {
    return [];
  }
}
export default function OutfitFilters({
  search,
  onApply,
}: {
  search: string;
  onApply: (items: OutfitItem[], tags: string[]) => void;
}) {
  const params = new URLSearchParams(search);
  const [items, setItems] = useState<OutfitItem[]>(readOutfitFilters(params));
  const [tags, setTags] = useState(params.getAll("tags").join(", "));
  return (
    <details className="rounded-lg border border-border bg-card">
      <summary className="min-h-11 cursor-pointer px-4 py-3 text-sm font-medium">
        아이템·모션·태그로 찾기
        {items.length > 0 ? ` · ${items.length}개 부위` : ""}
      </summary>
      <form
        className="space-y-5 border-t border-border p-4"
        onSubmit={(event) => {
          event.preventDefault();
          onApply(items, normalizeTags(tags));
        }}
      >
        <p className="text-sm text-muted-foreground">
          원하는 부위만 선택해 주세요. 선택한 조건을 모두 포함한 의장을 찾아요.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OUTFIT_SLOTS.map(([slot]) => (
            <ItemPicker
              key={slot}
              slot={slot}
              value={items.find((item) => item.slot === slot)}
              onChange={(item) =>
                setItems((current) => [
                  ...current.filter((entry) => entry.slot !== slot),
                  ...(item ? [item] : []),
                ])
              }
            />
          ))}
        </div>
        <label className="block text-sm">
          태그
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="쉼표로 구분"
            className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3"
          />
        </label>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="min-h-11 rounded-lg border border-border px-4"
            onClick={() => {
              setItems([]);
              setTags("");
              onApply([], []);
            }}
          >
            초기화
          </button>
          <button
            type="submit"
            className="min-h-11 rounded-lg bg-primary px-5 text-primary-foreground"
          >
            의장 찾기
          </button>
        </div>
      </form>
    </details>
  );
}
