"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ItemInfoCategory } from "@/types/item-info";

interface ItemInfoCategoryFilterProps {
  categories: ItemInfoCategory[];
  selectedTopCategory: string;
  selectedSubCategory: string;
  onTopCategoryChange: (category: string) => void;
  onSubCategoryChange: (category: string) => void;
}

export default function ItemInfoCategoryFilter({
  categories,
  selectedTopCategory,
  selectedSubCategory,
  onTopCategoryChange,
  onSubCategoryChange,
}: ItemInfoCategoryFilterProps) {
  const selectedCategory = categories.find(
    (c) => c.topCategory === selectedTopCategory,
  );
  const subCategories = selectedCategory?.subCategories || [];
  const subCategoryValue = selectedSubCategory || "__all__";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="item-info-top-category"
            className="block text-sm font-medium text-[var(--color-ds-secondary)] mb-2"
          >
            상위 분류
          </label>
          <Select
            value={selectedTopCategory}
            onValueChange={onTopCategoryChange}
          >
            <SelectTrigger
              id="item-info-top-category"
              className="w-full h-11 bg-white dark:bg-navy-800 border-[var(--color-ds-neutral-tone)] text-[var(--color-ds-text)]"
            >
              <SelectValue placeholder="상위 분류를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem
                  key={category.topCategory}
                  value={category.topCategory}
                >
                  {category.topCategory}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label
            htmlFor="item-info-sub-category"
            className="block text-sm font-medium text-[var(--color-ds-secondary)] mb-2"
          >
            하위 분류
          </label>
          <Select
            value={subCategoryValue}
            onValueChange={(value) =>
              onSubCategoryChange(value === "__all__" ? "" : value)
            }
            disabled={subCategories.length === 0}
          >
            <SelectTrigger
              id="item-info-sub-category"
              className="w-full h-11 bg-white dark:bg-navy-800 border-[var(--color-ds-neutral-tone)] text-[var(--color-ds-text)]"
            >
              <SelectValue placeholder="하위 분류를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">전체</SelectItem>
              {subCategories.map((sub) => (
                <SelectItem key={sub} value={sub}>
                  {sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground">
          상위 분류를 먼저 선택하면 해당 하위 분류 목록이 표시됩니다.
        </p>
      </div>
    </div>
  );
}
