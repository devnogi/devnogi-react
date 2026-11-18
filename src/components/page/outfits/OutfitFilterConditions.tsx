import { X } from "lucide-react";

import {
  type OutfitGender,
  type OutfitItem,
  type OutfitSlot,
  slotLabel,
} from "@/types/outfits";

const conditionStyle =
  "inline-flex min-h-11 items-center gap-1 rounded-lg bg-secondary px-3 focus-visible:outline-2 focus-visible:outline-ring";

export default function OutfitFilterConditions({
  genders,
  items,
  tags,
  motion,
  onClearGender,
  onClearItem,
  onClearTag,
  onClearMotion,
  onReset,
}: {
  genders: [OutfitGender, string][];
  items: OutfitItem[];
  tags: string[];
  motion: string | null;
  onClearGender: (gender: OutfitGender) => void;
  onClearItem: (slot: OutfitSlot) => void;
  onClearTag: (index: number) => void;
  onClearMotion: () => void;
  onReset: () => void;
}) {
  if (!genders.length && !items.length && !tags.length && !motion) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {genders.map(([value, label]) => (
        <button
          key={value}
          type="button"
          aria-label={label + " 조건 해제"}
          onClick={() => onClearGender(value)}
          className={conditionStyle}
        >
          {label} <X aria-hidden="true" className="size-3" />
        </button>
      ))}
      {items.map((item) => (
        <button
          key={item.slot}
          type="button"
          aria-label={slotLabel(item.slot) + " " + item.name + " 조건 해제"}
          onClick={() => onClearItem(item.slot)}
          className={conditionStyle}
        >
          {slotLabel(item.slot)} · {item.name}{" "}
          <X aria-hidden="true" className="size-3" />
        </button>
      ))}
      {tags.map((tag, index) => (
        <button
          key={tag + "-" + index}
          type="button"
          aria-label={"태그 " + tag + " 조건 해제"}
          onClick={() => onClearTag(index)}
          className={conditionStyle}
        >
          #{tag} <X aria-hidden="true" className="size-3" />
        </button>
      ))}
      {motion && (
        <button
          type="button"
          aria-label={"모션 " + motion + " 조건 해제"}
          onClick={onClearMotion}
          className={conditionStyle}
        >
          모션 · {motion} <X aria-hidden="true" className="size-3" />
        </button>
      )}
      <button
        type="button"
        onClick={onReset}
        className="min-h-11 px-2 font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
      >
        전체 초기화
      </button>
    </div>
  );
}
