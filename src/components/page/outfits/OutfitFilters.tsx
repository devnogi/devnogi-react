"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import {
  OUTFIT_SLOTS,
  type OutfitGender,
  type OutfitItem,
  type OutfitSlot,
} from "@/types/outfits";

import OutfitFilterConditions from "./OutfitFilterConditions";
import OutfitFilterDialog from "./OutfitFilterDialog";

const outfitCategories: {
  label: string;
  slots: readonly OutfitSlot[];
}[] = [
  { label: "머리", slots: ["HEAD"] },
  { label: "액세서리", slots: ["ACCESSORY_1", "ACCESSORY_2"] },
  { label: "얼굴장식", slots: ["FACE"] },
  { label: "의상", slots: ["CLOTHING"] },
  { label: "꼬리", slots: ["TAIL"] },
  { label: "장갑", slots: ["HANDS"] },
  { label: "신발", slots: ["FEET"] },
  { label: "무기", slots: ["WEAPON"] },
  { label: "로브", slots: ["ROBE"] },
  { label: "모션", slots: ["MOTION"] },
];
const genders: [OutfitGender, string][] = [
  ["MALE", "남"],
  ["FEMALE", "여"],
];
const buttonStyle =
  "min-h-11 shrink-0 rounded-lg border px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring";
const selectedStyle = "border-primary bg-secondary text-foreground";
const unselectedStyle =
  "border-border bg-card text-muted-foreground hover:bg-accent";

function readItems(params: URLSearchParams): OutfitItem[] {
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

function writeItems(next: URLSearchParams, items: OutfitItem[]) {
  if (items.length) next.set("items", JSON.stringify(items));
  else next.delete("items");
}

export default function OutfitFilters({
  search,
  onApply,
}: {
  search: string;
  onApply: (params: URLSearchParams) => void;
}) {
  const params = new URLSearchParams(search);
  const items = useMemo(() => readItems(new URLSearchParams(search)), [search]);
  const selectedGenders = params.getAll("gender");
  const tags = params.getAll("tags");
  const motion = params.get("motion");
  const [category, setCategory] = useState<
    (typeof outfitCategories)[number] | null
  >(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const change = (edit: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(search);
    edit(next);
    onApply(next);
  };
  const toggleGender = (gender: OutfitGender) => {
    change((next) => {
      const selected = new Set(next.getAll("gender"));
      if (selected.has(gender)) selected.delete(gender);
      else selected.add(gender);
      next.delete("gender");
      genders.forEach(([value]) => {
        if (selected.has(value)) next.append("gender", value);
      });
    });
  };
  const clearItem = (slot: OutfitSlot) => {
    change((next) =>
      writeItems(
        next,
        items.filter((item) => item.slot !== slot),
      ),
    );
  };
  const applyCategory = (draft: OutfitItem[], cleared: boolean) => {
    if (!category) return;
    change((next) => {
      writeItems(next, [
        ...items.filter((item) => !category.slots.includes(item.slot)),
        ...draft.filter((item) => category.slots.includes(item.slot)),
      ]);
      if (
        category.slots.includes("MOTION") &&
        (cleared ||
          JSON.stringify(draft.filter((item) => item.slot === "MOTION")) !==
            JSON.stringify(items.filter((item) => item.slot === "MOTION")))
      )
        next.delete("motion");
    });
    setCategory(null);
  };
  return (
    <div className="space-y-3">
      <div
        aria-label="의장 필터"
        className="flex max-w-full flex-nowrap gap-2 overflow-x-auto overscroll-x-contain pb-2 sm:flex-wrap sm:overflow-visible"
      >
        {genders.map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={selectedGenders.includes(value)}
            onClick={() => toggleGender(value)}
            className={cn(
              buttonStyle,
              selectedGenders.includes(value) ? selectedStyle : unselectedStyle,
            )}
          >
            {label}
          </button>
        ))}
        {outfitCategories.map((entry) => {
          const count = items.filter((item) =>
            entry.slots.includes(item.slot),
          ).length;
          const active = count > 0 || (entry.label === "모션" && !!motion);
          return (
            <button
              key={entry.label}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={category?.label === entry.label}
              onClick={(event) => {
                trigger.current = event.currentTarget;
                setCategory(entry);
              }}
              className={cn(
                buttonStyle,
                "inline-flex items-center gap-2",
                active ? selectedStyle : unselectedStyle,
              )}
            >
              {entry.label}
              {count > 0 && <span className="text-xs">{count}</span>}
              <ChevronDown aria-hidden="true" className="size-4" />
            </button>
          );
        })}
      </div>
      <OutfitFilterConditions
        genders={genders.filter(([value]) => selectedGenders.includes(value))}
        items={items}
        tags={tags}
        motion={motion}
        onClearGender={toggleGender}
        onClearItem={clearItem}
        onClearTag={(index) =>
          change((next) => {
            next.delete("tags");
            tags.forEach((entry, current) => {
              if (current !== index) next.append("tags", entry);
            });
          })
        }
        onClearMotion={() => change((next) => next.delete("motion"))}
        onReset={() => onApply(new URLSearchParams())}
      />
      <OutfitFilterDialog
        category={category}
        items={items}
        onApply={applyCategory}
        onClose={() => setCategory(null)}
        returnFocus={() => trigger.current?.focus()}
      />
    </div>
  );
}
