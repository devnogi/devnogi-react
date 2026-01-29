"use client";

import { ItemOptionInfo } from "@/types/item-option-info";

interface ItemOptionRowProps {
  item: ItemOptionInfo;
}

function getSubTypeBadgeStyle(subType: string): string {
  switch (subType) {
    case "+":
      return "bg-emerald-100 text-emerald-700";
    case "-":
      return "bg-rose-100 text-rose-700";
    case "%":
      return "bg-violet-100 text-violet-700";
    default:
      return "bg-[var(--color-ds-neutral-100)] text-[var(--color-ds-text)]";
  }
}

export default function ItemOptionRow({ item }: ItemOptionRowProps) {
  const displayValue = item.optionValue2 || item.optionValue;
  const fullOption = `${item.optionType} ${item.optionSubType}${displayValue}`;

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-ds-neutral-50)] transition-colors rounded-lg">
      <div className="flex items-center gap-2 min-w-[140px] md:min-w-[180px]">
        <span
          className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold ${getSubTypeBadgeStyle(item.optionSubType)}`}
        >
          {item.optionSubType || "="}
        </span>
        <span className="font-medium text-[var(--color-ds-text)]">{fullOption}</span>
      </div>
      <div className="flex-1 text-sm text-[var(--color-ds-secondary)]">
        {item.optionDesc || "-"}
      </div>
    </div>
  );
}
