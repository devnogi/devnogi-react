"use client";

import clsx from "clsx";
import { ItemCategory } from "@/lib/api/category";

const RecursiveCategoryItem = ({
  category,
  selectedId,
  onSelect,
  expandedIds,
  onToggleExpand,
}: {
  category: ItemCategory;
  selectedId: string;
  onSelect: (id: string) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
}) => {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedIds.has(category.id);
  const isSelected = category.id === selectedId;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggleExpand(category.id);
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(category.id);
    handleToggle(e);
  };

  return (
    <li>
      <span
        className={clsx(
          "p-1.5 cursor-pointer text-sm rounded-sm flex items-center hover:bg-gray-300",
          isSelected && "bg-gray-200 font-semibold",
        )}
        onClick={handleSelect}
      >
        {hasChildren && (
          <span
            className="w-4 flex-shrink-0 text-center"
            onClick={handleToggle}
          >
            {isExpanded ? "-" : "+"}
          </span>
        )}
        <span className={clsx(!hasChildren && "ml-4")}>{category.name}</span>
      </span>

      {isExpanded && hasChildren && (
        <ul className="pl-4">
          {category.children!.map((child) => (
            <RecursiveCategoryItem
              key={child.id}
              category={child}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default function AuctionCategory({
  categories,
  selectedId,
  onSelect,
  expandedIds,
  onToggleExpand,
}: {
  categories: ItemCategory[];
  selectedId: string;
  onSelect: (id: string) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
}) {
  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="text-center border border-gray-600 rounded-xs">
        카테고리
      </div>
      <div className="flex-1 p-1">
        <ul>
          {categories.map((category) => (
            <RecursiveCategoryItem
              key={category.id}
              category={category}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
