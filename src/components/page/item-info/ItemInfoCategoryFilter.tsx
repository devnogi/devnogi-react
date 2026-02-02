"use client";

import clsx from "clsx";
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

  return (
    <div className="space-y-4">
      {/* 상위 카테고리 */}
      <div>
        <label className="hidden md:block text-sm font-medium text-[var(--color-ds-secondary)] mb-2">
          상위 카테고리
        </label>
        {/* 데스크탑: flex-wrap, 모바일: 가로 스크롤 */}
        <div className="md:flex md:flex-wrap md:gap-2 hidden">
          {categories.map((category) => (
            <button
              key={category.topCategory}
              onClick={() => {
                onTopCategoryChange(category.topCategory);
                onSubCategoryChange("");
              }}
              className={clsx(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                selectedTopCategory === category.topCategory
                  ? "bg-[var(--color-ds-primary)] text-white shadow-md"
                  : "bg-[var(--color-ds-neutral-100)] text-[var(--color-ds-text)] hover:bg-[var(--color-ds-neutral-200)]",
              )}
            >
              {category.topCategory}
            </button>
          ))}
        </div>
        {/* 모바일: 가로 스크롤 캐러셀 */}
        <div className="md:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-1">
            {categories.map((category) => (
              <button
                key={category.topCategory}
                onClick={() => {
                  onTopCategoryChange(category.topCategory);
                  onSubCategoryChange("");
                }}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0",
                  selectedTopCategory === category.topCategory
                    ? "bg-[var(--color-ds-primary)] text-white shadow-md"
                    : "bg-[var(--color-ds-neutral-100)] text-[var(--color-ds-text)]",
                )}
              >
                {category.topCategory}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 하위 카테고리 */}
      {subCategories.length > 0 && (
        <div>
          <label className="hidden md:block text-sm font-medium text-[var(--color-ds-secondary)] mb-2">
            하위 카테고리
          </label>
          {/* 데스크탑: flex-wrap */}
          <div className="md:flex md:flex-wrap md:gap-2 hidden">
            <button
              onClick={() => onSubCategoryChange("")}
              className={clsx(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                selectedSubCategory === ""
                  ? "bg-[var(--color-ds-gold)] text-white shadow-md"
                  : "bg-[var(--color-ds-neutral-100)] text-[var(--color-ds-text)] hover:bg-[var(--color-ds-neutral-200)]",
              )}
            >
              전체
            </button>
            {subCategories.map((sub) => (
              <button
                key={sub}
                onClick={() => onSubCategoryChange(sub)}
                className={clsx(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  selectedSubCategory === sub
                    ? "bg-[var(--color-ds-gold)] text-white shadow-md"
                    : "bg-[var(--color-ds-neutral-100)] text-[var(--color-ds-text)] hover:bg-[var(--color-ds-neutral-200)]",
                )}
              >
                {sub}
              </button>
            ))}
          </div>
          {/* 모바일: 가로 스크롤 캐러셀 */}
          <div className="md:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 pb-1">
              <button
                onClick={() => onSubCategoryChange("")}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0",
                  selectedSubCategory === ""
                    ? "bg-[var(--color-ds-gold)] text-white shadow-md"
                    : "bg-[var(--color-ds-neutral-100)] text-[var(--color-ds-text)]",
                )}
              >
                전체
              </button>
              {subCategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => onSubCategoryChange(sub)}
                  className={clsx(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0",
                    selectedSubCategory === sub
                      ? "bg-[var(--color-ds-gold)] text-white shadow-md"
                      : "bg-[var(--color-ds-neutral-100)] text-[var(--color-ds-text)]",
                  )}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
