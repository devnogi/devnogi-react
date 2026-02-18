"use client";

import { ItemOption } from "@/hooks/useAuctionHistory";
import {
  groupOptionsByCategory,
  GroupedOption,
  isPenaltyOption,
  parseOptionValue,
  formatEnchantType,
} from "@/lib/itemOptionUtils";

interface ItemOptionPopoverProps {
  itemDisplayName: string;
  itemOptions: ItemOption[];
  price: number;
}

/**
 * 아이템 옵션 팝오버 내부 컴포넌트
 * RPG 아이템 툴팁 스타일의 옵션 그룹화 UI
 */
export default function ItemOptionPopover({
  itemDisplayName,
  itemOptions,
  price,
}: ItemOptionPopoverProps) {
  const groupedOptions = groupOptionsByCategory(itemOptions);

  const formatPrice = (price: number) => {
    return price.toLocaleString("ko-KR");
  };

  return (
    <div className="flex flex-col">
      {/* 아이템 이름 */}
      <div className="text-gray-900 dark:text-white font-semibold text-sm mb-2 pb-2 border-b border-gray-200 dark:border-white/20">
        {itemDisplayName}
      </div>

      {/* 옵션 그룹 영역 (스크롤 가능, 스크롤바 숨김) */}
      <div className="pt-1 flex-1 overflow-y-auto max-h-[calc(70vh-120px)] space-y-3 pr-1 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {groupedOptions.map((group) => (
          <OptionGroup key={group.categoryId} group={group} />
        ))}
      </div>

      {/* 가격 정보 (하단 고정) */}
      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-white/20">
        <div className="text-xs text-amber-600 dark:text-[#ffcc00] font-semibold">
          가격 : {formatPrice(price)} Gold
        </div>
      </div>
    </div>
  );
}

/**
 * 옵션 그룹 컴포넌트
 */
function OptionGroup({ group }: { group: GroupedOption }) {
  return (
    <div className="relative border border-gray-300 dark:border-white/30 rounded-sm pt-3 pb-2 px-2.5 mt-1">
      {/* 카테고리 라벨 (테두리에 겹치는 스타일) */}
      <span className="absolute -top-2.5 left-2 px-1.5 bg-white dark:bg-navy-800 text-amber-600 dark:text-[#e8a854] text-xs font-semibold leading-normal z-20">
        {group.categoryLabel}
      </span>

      {/* 옵션 목록 */}
      <div className="space-y-0.5">
        {group.categoryId === "enchant" ? (
          <EnchantOptions options={group.options} />
        ) : group.categoryId === "reforge" ? (
          <ReforgeOptions options={group.options} />
        ) : group.categoryId === "artisan" ? (
          <ArtisanOptions options={group.options} />
        ) : group.categoryId === "erg" ? (
          <ErgOptions options={group.options} />
        ) : group.categoryId === "itemColor" ? (
          <ItemColorOptions options={group.options} />
        ) : (
          <DefaultOptions options={group.options} />
        )}
      </div>
    </div>
  );
}

/**
 * 기본 옵션 렌더링 (아이템 속성, 세트 아이템, 아이템 색상)
 */
function DefaultOptions({ options }: { options: ItemOption[] }) {
  return (
    <>
      {options.map((option) => (
        <OptionLine key={option.id} option={option} />
      ))}
    </>
  );
}

/**
 * 인챈트 옵션 렌더링
 * [접두/접미] 인챈트명 형식 + 효과 목록
 */
function EnchantOptions({ options }: { options: ItemOption[] }) {
  // 인챈트를 접두/접미로 그룹화
  const prefixEnchants = options.filter((o) => o.optionSubType === "접두");
  const suffixEnchants = options.filter((o) => o.optionSubType === "접미");
  const otherEnchants = options.filter(
    (o) => o.optionSubType !== "접두" && o.optionSubType !== "접미",
  );

  return (
    <>
      {prefixEnchants.map((option) => (
        <EnchantItem key={option.id} option={option} />
      ))}
      {suffixEnchants.map((option) => (
        <EnchantItem key={option.id} option={option} />
      ))}
      {otherEnchants.map((option) => (
        <EnchantItem key={option.id} option={option} />
      ))}
    </>
  );
}

function EnchantItem({ option }: { option: ItemOption }) {
  const enchantType = formatEnchantType(option.optionSubType);
  const hasDesc = option.optionDesc && option.optionDesc.trim().length > 0;

  // optionDesc의 ',' 문자를 개행으로 변환하고 각 줄 앞에 '-' 추가
  const formatEnchantDesc = (desc: string): string[] => {
    return desc
      .split(/[,\n]/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => (line.startsWith("-") ? line : `- ${line}`));
  };

  return (
    <div className="mb-1.5">
      {/* 인챈트 헤더 */}
      <div className="text-xs text-gray-600 dark:text-[#ccc]">
        {enchantType && (
          <span className="text-blue-500 dark:text-[#7cb3ff] mr-1">{enchantType}</span>
        )}
        <span className="text-gray-900 dark:text-white">{option.optionValue}</span>
      </div>
      {/* 인챈트 효과 설명 */}
      {hasDesc && (
        <div className="ml-3 mt-0.5">
          {formatEnchantDesc(option.optionDesc!).map((line, idx) => (
            <EffectLine key={idx} text={line} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 개조 옵션 렌더링
 * 일반/특별/장인/보석 개조 구분 표시
 */
function ReforgeOptions({ options }: { options: ItemOption[] }) {
  // 개조 타입별로 그룹화
  const groupedByType = new Map<string, ItemOption[]>();

  options.forEach((option) => {
    const existing = groupedByType.get(option.optionType) || [];
    existing.push(option);
    groupedByType.set(option.optionType, existing);
  });

  const typeOrder = ["일반 개조", "특별 개조", "장인 개조", "보석 개조"];

  return (
    <>
      {typeOrder.map((type) => {
        const typeOptions = groupedByType.get(type);
        if (!typeOptions || typeOptions.length === 0) return null;

        return (
          <div key={type} className="mb-2 last:mb-0">
            {/* 개조 타입 소제목 */}
            <div className="text-xs text-gray-500 dark:text-[#b0b0b0] font-medium mb-0.5">
              {type}
            </div>
            {/* 개조 효과 목록 */}
            <div className="ml-2">
              {typeOptions.map((option) => (
                <ReforgeItem key={option.id} option={option} />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

function ReforgeItem({ option }: { option: ItemOption }) {
  const hasDesc = option.optionDesc && option.optionDesc.trim().length > 0;

  return (
    <div className="mb-1 last:mb-0">
      <div className="text-xs text-gray-600 dark:text-[#ccc]">
        {option.optionSubType && (
          <span className="text-gray-500 dark:text-[#a0a0a0] mr-1">{option.optionSubType}:</span>
        )}
        <HighlightedValue value={option.optionValue} />
      </div>
      {hasDesc && (
        <div className="ml-3 mt-0.5">
          {option.optionDesc?.split("\n").map((line, idx) => (
            <EffectLine key={idx} text={line} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 세공 옵션 렌더링
 * optionSubType ASC 정렬, optionValue만 표시
 */
function ArtisanOptions({ options }: { options: ItemOption[] }) {
  // optionSubType ASC 정렬
  const sortedOptions = [...options].sort((a, b) => {
    const subTypeA = a.optionSubType || "";
    const subTypeB = b.optionSubType || "";
    return subTypeA.localeCompare(subTypeB, "ko");
  });

  return (
    <>
      {sortedOptions.map((option) => (
        <div key={option.id} className="mb-1 last:mb-0">
          <div className="text-xs text-gray-600 dark:text-[#ccc]">
            {option.optionValue}
          </div>
          {option.optionDesc && (
            <div className="ml-3 mt-0.5">
              {option.optionDesc.split("\n").map((line, idx) => (
                <EffectLine key={idx} text={line} />
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

/**
 * 에르그 옵션 렌더링
 */
function ErgOptions({ options }: { options: ItemOption[] }) {
  // 에르그 등급과 에르그 효과 분리
  const gradeOption = options.find((o) => o.optionType === "에르그 등급");
  const effectOptions = options.filter((o) => o.optionType !== "에르그 등급");

  return (
    <>
      {/* 에르그 등급 */}
      {gradeOption && (
        <div className="text-xs text-gray-600 dark:text-[#ccc] mb-1">
          <span className="text-gray-500 dark:text-[#b0b0b0]">등급: </span>
          <span className="text-blue-500 dark:text-[#7cb3ff] font-medium">
            {gradeOption.optionValue}
          </span>
        </div>
      )}
      {/* 에르그 효과 */}
      {effectOptions.map((option) => (
<div key={option.id} className="mb-1.5 last:mb-0">
  <div className="flex items-center text-xs whitespace-nowrap">
    {option.optionSubType && (
      <span className="text-gray-500 dark:text-[#b0b0b0] font-medium">
        {option.optionSubType}
      </span>
    )}

    <span className="ml-2">
      <HighlightedValue value={option.optionValue} />
    </span>
  </div>

  {option.optionDesc && (
    <div className="ml-3 mt-0.5">
      {option.optionDesc.split("\n").map((line, idx) => (
        <EffectLine key={idx} text={line} />
      ))}
    </div>
  )}
</div>

      ))}
    </>
  );
}

/**
 * 아이템 색상 옵션 렌더링
 * RGB 값을 파싱하여 색상 표시와 함께 렌더링
 * 형식: ● {option_sub_type} : {option_value}
 */
function ItemColorOptions({ options }: { options: ItemOption[] }) {
  // optionSubType ASC 정렬
  const sortedOptions = [...options].sort((a, b) => {
    const subTypeA = a.optionSubType || "";
    const subTypeB = b.optionSubType || "";
    return subTypeA.localeCompare(subTypeB, "ko");
  });

  // RGB 값 파싱 함수: 다양한 형태에서 rgb 추출
  // 지원 형식: "(255,255,255)", "255,255,255", "255, 255, 255" 등
  const parseRgbColor = (value: string | null | undefined): string | null => {
    if (!value) return null;
    // 괄호 있는 형식: (255,255,255) 또는 (255, 255, 255)
    const withParenMatch = value.match(/\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\)/);
    if (withParenMatch) {
      const [, r, g, b] = withParenMatch;
      return `rgb(${r}, ${g}, ${b})`;
    }
    // 괄호 없는 형식: 255,255,255 또는 255, 255, 255
    const withoutParenMatch = value.match(/^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)$/);
    if (withoutParenMatch) {
      const [, r, g, b] = withoutParenMatch;
      return `rgb(${r}, ${g}, ${b})`;
    }
    return null;
  };

  return (
    <>
      {sortedOptions.map((option) => {
        const rgbColor = parseRgbColor(option.optionValue);
        return (
          <div key={option.id} className="text-xs text-gray-600 dark:text-[#ccc] leading-relaxed">
            <span
              style={{ color: rgbColor || undefined }}
              className="mr-1 text-gray-400 dark:text-[#ccc]"
            >
              ●
            </span>
            <span className="text-gray-500 dark:text-[#a0a0a0]">
              {option.optionSubType || option.optionType}:
            </span>{" "}
            <span>{option.optionValue}</span>
          </div>
        );
      })}
    </>
  );
}

/**
 * 단일 옵션 라인 렌더링
 */
function OptionLine({ option }: { option: ItemOption }) {
  const value = option.optionValue2
    ? `${option.optionValue} ~ ${option.optionValue2}`
    : option.optionValue;

  return (
    <div className="text-xs text-gray-600 dark:text-[#ccc] leading-relaxed">
      <span className="text-gray-500 dark:text-[#a0a0a0]">{option.optionType}: </span>
      <HighlightedValue value={value} />
    </div>
  );
}

/**
 * 효과 라인 렌더링 (들여쓰기된 서브 효과)
 */
function EffectLine({ text }: { text: string }) {
  const isPenalty = isPenaltyOption(text);
  const trimmedText = text.trim();

  if (!trimmedText) return null;

  // ㄴ 기호로 시작하는 서브 항목인지 확인
  const isSubItem = trimmedText.startsWith("ㄴ") || trimmedText.startsWith("L");

  return (
    <div
      className={`text-xs leading-relaxed ${
        isPenalty ? "text-red-500 dark:text-[#cc6666]" : "text-gray-600 dark:text-[#ccc]"
      } ${isSubItem ? "ml-1" : ""}`}
    >
      <HighlightedValue value={trimmedText} isPenalty={isPenalty} />
    </div>
  );
}

/**
 * 숫자 값 강조 표시
 */
function HighlightedValue({
  value,
  isPenalty = false,
}: {
  value: string;
  isPenalty?: boolean;
}) {
  const segments = parseOptionValue(value);

  return (
    <>
      {segments.map((segment, idx) => {
        if (segment.type === "number") {
          return (
            <span
              key={idx}
              className={isPenalty ? "text-red-500 dark:text-[#cc6666]" : "text-blue-500 dark:text-[#7cb3ff]"}
            >
              {segment.value}
            </span>
          );
        }
        return <span key={idx}>{segment.value}</span>;
      })}
    </>
  );
}
