/**
 * 아이템 옵션 카테고리 매핑 및 표시 순서 정의
 * optionType을 기반으로 카테고리를 분류하고, UI에서의 표시 순서를 관리합니다.
 */

// 카테고리 ID (표시 순서대로 정의)
export type OptionCategoryId =
  | "itemAttribute"
  | "enchant"
  | "reforge"
  | "artisan"
  | "erg"
  | "setItem"
  | "itemColor";

// 카테고리 정보 인터페이스
export interface OptionCategory {
  id: OptionCategoryId;
  label: string;
  order: number;
  optionTypes: string[];
}

// 카테고리별 optionType 매핑
export const OPTION_CATEGORIES: OptionCategory[] = [
  {
    id: "itemAttribute",
    label: "아이템 속성",
    order: 1,
    optionTypes: [
      "공격",
      "부상률",
      "크리티컬",
      "밸런스",
      "내구력",
      "내구도",
      "방어력",
      "마법 방어력",
      "보호",
      "마법 보호",
      "피어싱 레벨",
      "숙련",
      "품질",
      "크기",
      "남은 거래 횟수",
      "남은 사용 횟수",
      "남은 전용 해제 가능 횟수",
      "전용 해제 거래 보증서 사용 불가",
      "아이템 보호",
      "사용 효과",
      "토템 효과",
      "펫 정보",
      "무리아스 유물",
      "에코스톤 등급",
      "에코스톤 고유 능력",
      "에코스톤 각성 능력",
      "인챈트 종류",
      "인챈트 불가능",
    ],
  },
  {
    id: "enchant",
    label: "인챈트",
    order: 2,
    optionTypes: ["인챈트"],
  },
  {
    id: "reforge",
    label: "개조",
    order: 3,
    optionTypes: ["일반 개조", "특별 개조", "장인 개조", "보석 개조"],
  },
  {
    id: "artisan",
    label: "세공",
    order: 4,
    optionTypes: ["세공 옵션"],
  },
  {
    id: "erg",
    label: "에르그",
    order: 5,
    optionTypes: ["에르그", "에르그 등급"],
  },
  {
    id: "setItem",
    label: "세트 아이템",
    order: 6,
    optionTypes: ["세트 효과"],
  },
  {
    id: "itemColor",
    label: "아이템 색상",
    order: 7,
    optionTypes: ["아이템 색상", "색상"],
  },
];

// optionType -> 카테고리 ID 빠른 조회용 맵
export const OPTION_TYPE_TO_CATEGORY: Map<string, OptionCategoryId> = new Map(
  OPTION_CATEGORIES.flatMap((category) =>
    category.optionTypes.map((optionType) => [optionType, category.id]),
  ),
);

// 카테고리 ID -> 카테고리 정보 빠른 조회용 맵
export const CATEGORY_BY_ID: Map<OptionCategoryId, OptionCategory> = new Map(
  OPTION_CATEGORIES.map((category) => [category.id, category]),
);

// 카테고리 표시 순서 배열 (정렬된 상태)
export const CATEGORY_ORDER: OptionCategoryId[] = OPTION_CATEGORIES.sort(
  (a, b) => a.order - b.order,
).map((c) => c.id);
