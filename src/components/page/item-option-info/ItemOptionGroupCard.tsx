"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

import { ItemOptionInfoGroup } from "@/types/item-option-info";

import ItemOptionRow from "./ItemOptionRow";

interface ItemOptionGroupCardProps {
  group: ItemOptionInfoGroup;
  defaultExpanded?: boolean;
}

export default function ItemOptionGroupCard({
  group,
  defaultExpanded = true,
}: ItemOptionGroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-[var(--color-ds-card)] rounded-lg border border-[var(--color-ds-neutral-tone)] overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[var(--color-ds-card)] hover:bg-[var(--color-ds-neutral-50)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-[var(--color-ds-text)]">
            {group.optionType}
          </span>
          <span className="text-sm text-[var(--color-ds-disabled)]">
            ({group.items.length}개)
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[var(--color-ds-disabled)]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[var(--color-ds-disabled)]" />
        )}
      </button>

      {isExpanded && (
        <div className="divide-y divide-[var(--color-ds-neutral-50)]">
          {group.items.map((item, idx) => (
            <ItemOptionRow
              key={`${item.optionType}-${item.optionSubType}-${item.optionValue}-${idx}`}
              item={item}
            />
          ))}
        </div>
      )}
    </div>
  );
}
