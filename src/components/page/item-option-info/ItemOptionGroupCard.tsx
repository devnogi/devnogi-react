"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
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
    <div className="bg-white rounded-2xl border border-[var(--color-ds-neutral-tone)] overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all"
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
            <ItemOptionRow key={`${item.optionType}-${item.optionSubType}-${item.optionValue}-${idx}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
