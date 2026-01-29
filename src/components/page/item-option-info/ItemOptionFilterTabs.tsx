"use client";

interface FilterTab {
  id: string;
  label: string;
  keywords: string[];
}

const FILTER_TABS: FilterTab[] = [
  { id: "all", label: "전체", keywords: [] },
  { id: "stat", label: "스탯", keywords: ["STR", "DEX", "INT", "WILL", "LUCK", "HP", "MP", "SP", "체력", "민첩", "솜씨", "지력", "의지", "행운"] },
  { id: "attack", label: "공격", keywords: ["최대 대미지", "최소 대미지", "대미지", "크리티컬", "밸런스", "명중", "공격력", "마법 공격력"] },
  { id: "defense", label: "방어", keywords: ["방어력", "보호", "마법 방어력", "마법 보호", "회피"] },
  { id: "special", label: "특수", keywords: ["내구", "수리", "피어싱", "스플래시", "인챈트", "세공", "에르그", "에테르"] },
  { id: "etc", label: "기타", keywords: [] },
];

interface ItemOptionFilterTabsProps {
  selectedTab: string;
  onTabChange: (tabId: string) => void;
}

export default function ItemOptionFilterTabs({
  selectedTab,
  onTabChange,
}: ItemOptionFilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            selectedTab === tab.id
              ? "bg-[var(--color-ds-primary)] text-white"
              : "bg-[var(--color-ds-neutral-50)] text-[var(--color-ds-text)] hover:bg-[var(--color-ds-neutral-100)]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export { FILTER_TABS };
export type { FilterTab };
