"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { StatisticsTabType } from "./StatisticsTabs";

interface StatisticsSearchFormProps {
  activeTab: StatisticsTabType;
  onSearch: (params: {
    topCategory: string;
    subCategory: string;
    itemName: string;
  }) => void;
}

const topCategories = [
  "근거리 장비",
  "원거리 장비",
  "마법 장비",
  "방어 장비",
  "의류",
  "잡화",
  "소모품",
  "설치물",
  "인챈트 스크롤",
  "마법서",
  "기타",
];

const subCategoriesMap: Record<string, string[]> = {
  "근거리 장비": ["검", "둔기", "랜스", "도끼", "너클", "체인 블레이드", "실린더"],
  "원거리 장비": ["석궁", "활", "수리검", "아틀라틀"],
  "마법 장비": ["완드", "스태프"],
  "방어 장비": ["중갑옷", "경갑옷", "천옷", "방패", "헬멧"],
  "의류": ["옷", "장갑", "신발", "모자", "액세서리", "날개", "꼬리"],
  "잡화": ["도면", "옷본", "매뉴얼", "기타"],
  "소모품": ["포션", "음식", "기타"],
};

export default function StatisticsSearchForm({
  activeTab,
  onSearch,
}: StatisticsSearchFormProps) {
  const [topCategory, setTopCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [itemName, setItemName] = useState("");

  const subCategories = topCategory ? subCategoriesMap[topCategory] ?? [] : [];

  const handleTopCategoryChange = (value: string) => {
    setTopCategory(value);
    setSubCategory("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ topCategory, subCategory, itemName });
  };

  const isSearchDisabled = () => {
    if (activeTab === "top-category") return !topCategory;
    if (activeTab === "subcategory") return !topCategory || !subCategory;
    return !topCategory || !subCategory || !itemName.trim();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-3 lg:flex-row lg:items-end">
        {/* Top Category */}
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            탑 카테고리
          </label>
          <select
            value={topCategory}
            onChange={(e) => handleTopCategoryChange(e.target.value)}
            className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blaanid-500/20 dark:focus:ring-coral-500/20"
          >
            <option value="">선택하세요</option>
            {topCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sub Category - only for item and subcategory tabs */}
        {activeTab !== "top-category" && (
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              서브 카테고리
            </label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              disabled={!topCategory}
              className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blaanid-500/20 dark:focus:ring-coral-500/20 disabled:opacity-50"
            >
              <option value="">선택하세요</option>
              {subCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Item Name - only for item tab */}
        {activeTab === "item" && (
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              아이템명
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="아이템명을 입력하세요"
              className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blaanid-500/20 dark:focus:ring-coral-500/20"
            />
          </div>
        )}

        {/* Search Button */}
        <button
          type="submit"
          disabled={isSearchDisabled()}
          className="h-10 px-6 text-sm font-medium text-white bg-blaanid-500 dark:bg-coral-500 hover:bg-blaanid-600 dark:hover:bg-coral-600 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Search className="w-4 h-4" />
          조회
        </button>
      </div>
    </form>
  );
}
