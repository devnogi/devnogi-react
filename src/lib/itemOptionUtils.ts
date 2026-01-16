/**
 * 아이템 옵션 그룹화 및 포맷팅 유틸리티
 */

import { ItemOption } from "@/hooks/useAuctionHistory";
import {
  OptionCategoryId,
  OPTION_TYPE_TO_CATEGORY,
  CATEGORY_BY_ID,
  CATEGORY_ORDER,
} from "./itemOptionCategories";

// 그룹화된 옵션 인터페이스
export interface GroupedOption {
  categoryId: OptionCategoryId;
  categoryLabel: string;
  options: ItemOption[];
}

/**
 * 아이템 옵션을 카테고리별로 그룹화
 * @param options 아이템 옵션 배열
 * @returns 카테고리별로 그룹화된 옵션 배열 (정렬된 순서)
 */
export function groupOptionsByCategory(
  options: ItemOption[],
): GroupedOption[] {
  // 카테고리별로 옵션 분류
  const categoryMap = new Map<OptionCategoryId, ItemOption[]>();

  options.forEach((option) => {
    const categoryId = OPTION_TYPE_TO_CATEGORY.get(option.optionType);

    if (categoryId) {
      const existing = categoryMap.get(categoryId) || [];
      existing.push(option);
      categoryMap.set(categoryId, existing);
    } else {
      // 매핑되지 않은 optionType은 '아이템 속성'으로 분류
      const existing = categoryMap.get("itemAttribute") || [];
      existing.push(option);
      categoryMap.set("itemAttribute", existing);
    }
  });

  // 정해진 순서대로 정렬하여 반환
  const result: GroupedOption[] = [];

  CATEGORY_ORDER.forEach((categoryId) => {
    const options = categoryMap.get(categoryId);
    if (options && options.length > 0) {
      const category = CATEGORY_BY_ID.get(categoryId);
      if (category) {
        result.push({
          categoryId,
          categoryLabel: category.label,
          options,
        });
      }
    }
  });

  return result;
}

/**
 * 옵션 값이 패널티(감소 효과)인지 확인
 * @param optionValue 옵션 값 문자열
 * @returns 패널티 여부
 */
export function isPenaltyOption(optionValue: string): boolean {
  // 감소, 마이너스 값, 패널티 키워드 확인
  const penaltyPatterns = [
    /감소/,
    /-\d+/,
    /\d+\s*감소/,
    /저하/,
    /약화/,
  ];

  return penaltyPatterns.some((pattern) => pattern.test(optionValue));
}

/**
 * 옵션 값에서 숫자(핵심 수치) 추출 및 강조 표시용 파싱
 * @param value 옵션 값 문자열
 * @returns 파싱된 세그먼트 배열 (텍스트/숫자 구분)
 */
export interface ValueSegment {
  type: "text" | "number";
  value: string;
}

export function parseOptionValue(value: string): ValueSegment[] {
  const segments: ValueSegment[] = [];
  // 숫자, 퍼센트, 범위(~) 포함 패턴
  const regex = /([+-]?\d+(?:\.\d+)?%?(?:\s*~\s*[+-]?\d+(?:\.\d+)?%?)?)/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(value)) !== null) {
    // 숫자 앞 텍스트
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        value: value.slice(lastIndex, match.index),
      });
    }
    // 숫자 부분
    segments.push({
      type: "number",
      value: match[0],
    });
    lastIndex = regex.lastIndex;
  }

  // 남은 텍스트
  if (lastIndex < value.length) {
    segments.push({
      type: "text",
      value: value.slice(lastIndex),
    });
  }

  // 세그먼트가 없으면 전체를 텍스트로
  if (segments.length === 0) {
    segments.push({ type: "text", value });
  }

  return segments;
}

/**
 * 인챈트 옵션의 접두/접미 타입 포맷팅
 * @param optionSubType 옵션 서브타입 (접두/접미)
 * @returns 포맷된 문자열 (예: "[접두]")
 */
export function formatEnchantType(optionSubType: string | null): string {
  if (!optionSubType) return "";
  if (optionSubType === "접두" || optionSubType === "접미") {
    return `[${optionSubType}]`;
  }
  return optionSubType;
}

/**
 * 개조 옵션의 서브 카테고리 추출
 * @param optionType 옵션 타입 (일반 개조, 특별 개조, 장인 개조, 보석 개조)
 * @returns 서브 카테고리 레이블
 */
export function getReforgeSubCategory(optionType: string): string {
  const mapping: Record<string, string> = {
    "일반 개조": "일반 개조",
    "특별 개조": "특별 개조",
    "장인 개조": "장인 개조",
    "보석 개조": "보석 개조",
  };
  return mapping[optionType] || optionType;
}
