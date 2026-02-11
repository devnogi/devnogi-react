"use client";

import { ItemInfoCategory } from "@/types/item-info";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
          <label className="block text-sm font-medium text-[var(--color-ds-secondary)] mb-2">
            탑카테고리
          </label>
          <Select
            value={selectedTopCategory}
            onValueChange={(value) => {
              onTopCategoryChange(value);
              onSubCategoryChange("");
            }}
          >
            <SelectTrigger className="w-full h-11 bg-white dark:bg-navy-800 border-[var(--color-ds-neutral-tone)] text-[var(--color-ds-text)]">
              <SelectValue placeholder="탑카테고리를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.topCategory} value={category.topCategory}>
                  {category.topCategory}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-ds-secondary)] mb-2">
            서브카테고리
          </label>
          <Select
            value={subCategoryValue}
            onValueChange={(value) => onSubCategoryChange(value === "__all__" ? "" : value)}
            disabled={subCategories.length === 0}
          >
            <SelectTrigger className="w-full h-11 bg-white dark:bg-navy-800 border-[var(--color-ds-neutral-tone)] text-[var(--color-ds-text)]">
              <SelectValue placeholder="서브카테고리를 선택하세요" />
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
        <p className="text-xs text-[var(--color-ds-disabled)]">
          탑카테고리를 먼저 선택하면 해당 서브카테고리 목록이 표시됩니다.
        </p>
      </div>
    </div>
  );
}
