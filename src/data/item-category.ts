export type ItemCategory = {
  id: string;
  name: string;
  children?: ItemCategory[];
};

type TopSubCategoryPair = {
  topCategory: string;
  subCategory: string;
};

const ITEM_CATEGORY_ENUM_PAIRS: TopSubCategoryPair[] = [
  { topCategory: "근거리 장비", subCategory: "한손 장비" },
  { topCategory: "근거리 장비", subCategory: "양손 장비" },
  { topCategory: "근거리 장비", subCategory: "검" },
  { topCategory: "근거리 장비", subCategory: "도끼" },
  { topCategory: "근거리 장비", subCategory: "둔기" },
  { topCategory: "근거리 장비", subCategory: "랜스" },
  { topCategory: "근거리 장비", subCategory: "핸들" },
  { topCategory: "근거리 장비", subCategory: "너클" },
  { topCategory: "근거리 장비", subCategory: "체인 블레이드" },
  { topCategory: "원거리 장비", subCategory: "활" },
  { topCategory: "원거리 장비", subCategory: "석궁" },
  { topCategory: "원거리 장비", subCategory: "듀얼건" },
  { topCategory: "원거리 장비", subCategory: "수리검" },
  { topCategory: "원거리 장비", subCategory: "아틀라틀" },
  { topCategory: "원거리 장비", subCategory: "원거리 소모품" },
  { topCategory: "마법 장비", subCategory: "실린더" },
  { topCategory: "마법 장비", subCategory: "스태프" },
  { topCategory: "마법 장비", subCategory: "원드" },
  { topCategory: "마법 장비", subCategory: "마도서" },
  { topCategory: "마법 장비", subCategory: "오브" },
  { topCategory: "갑옷 장비", subCategory: "중갑옷" },
  { topCategory: "갑옷 장비", subCategory: "경갑옷" },
  { topCategory: "갑옷 장비", subCategory: "천옷" },
  { topCategory: "방어 장비", subCategory: "장갑" },
  { topCategory: "방어 장비", subCategory: "신발" },
  { topCategory: "방어 장비", subCategory: "모자/가발" },
  { topCategory: "방어 장비", subCategory: "방패" },
  { topCategory: "방어 장비", subCategory: "로브" },
  { topCategory: "액세서리", subCategory: "얼굴 장식" },
  { topCategory: "액세서리", subCategory: "액세서리" },
  { topCategory: "액세서리", subCategory: "날개" },
  { topCategory: "액세서리", subCategory: "꼬리" },
  { topCategory: "특수 장비", subCategory: "악기" },
  { topCategory: "특수 장비", subCategory: "생활 도구" },
  { topCategory: "특수 장비", subCategory: "마리오네트" },
  { topCategory: "특수 장비", subCategory: "에코스톤" },
  { topCategory: "특수 장비", subCategory: "에이도스" },
  { topCategory: "특수 장비", subCategory: "유물" },
  { topCategory: "특수 장비", subCategory: "기타 장비" },
  { topCategory: "설치물", subCategory: "의자/사물" },
  { topCategory: "설치물", subCategory: "낭만농장/달빛섬" },
  { topCategory: "인챈트 용품", subCategory: "인챈트 스크롤" },
  { topCategory: "인챈트 용품", subCategory: "마법가루" },
  { topCategory: "스크롤", subCategory: "도면" },
  { topCategory: "스크롤", subCategory: "옷본" },
  { topCategory: "스크롤", subCategory: "마족 스크롤" },
  { topCategory: "스크롤", subCategory: "기타 스크롤" },
  { topCategory: "마기그래프 용품", subCategory: "마기그래프" },
  { topCategory: "마기그래프 용품", subCategory: "마기그래프 도안" },
  { topCategory: "마기그래프 용품", subCategory: "기타 재료" },
  { topCategory: "서적", subCategory: "책" },
  { topCategory: "서적", subCategory: "마비노벨" },
  { topCategory: "서적", subCategory: "페이지" },
  { topCategory: "소모품", subCategory: "포션" },
  { topCategory: "소모품", subCategory: "음식" },
  { topCategory: "소모품", subCategory: "허브" },
  { topCategory: "소모품", subCategory: "던전 통행증" },
  { topCategory: "소모품", subCategory: "알반 훈련석" },
  { topCategory: "소모품", subCategory: "개조석" },
  { topCategory: "소모품", subCategory: "보석" },
  { topCategory: "소모품", subCategory: "변신 메달" },
  { topCategory: "소모품", subCategory: "염색 앰플" },
  { topCategory: "소모품", subCategory: "스케치" },
  { topCategory: "소모품", subCategory: "핀즈비즈" },
  { topCategory: "소모품", subCategory: "기타 소모품" },
  { topCategory: "토템", subCategory: "토템" },
  { topCategory: "생활 재료", subCategory: "주머니" },
  { topCategory: "생활 재료", subCategory: "천옷/방직" },
  { topCategory: "생활 재료", subCategory: "제련/블랙스미스" },
  { topCategory: "생활 재료", subCategory: "힐웬 공학" },
  { topCategory: "생활 재료", subCategory: "매직 크래프트" },
  { topCategory: "기타", subCategory: "제스처" },
  { topCategory: "기타", subCategory: "말풍선 스티커" },
  { topCategory: "기타", subCategory: "피니 펫" },
  { topCategory: "기타", subCategory: "불타래" },
  { topCategory: "기타", subCategory: "퍼퓸" },
  { topCategory: "기타", subCategory: "분양 메달" },
  { topCategory: "기타", subCategory: "뷰티 쿠폰" },
  { topCategory: "기타", subCategory: "기타" },
];

function extractTopCategories(categories: ItemCategory[]): ItemCategory[] {
  const allNode = categories.find(
    (category) => category.id === "all" && category.children && category.children.length > 0,
  );

  if (allNode?.children) {
    return allNode.children;
  }

  return categories.filter((category) => category.id !== "all");
}

function toTopSubPairs(categories: ItemCategory[]): TopSubCategoryPair[] {
  const topCategories = extractTopCategories(categories);
  const pairs: TopSubCategoryPair[] = [];

  topCategories.forEach((topCategory) => {
    const topName = topCategory.name || topCategory.id;

    topCategory.children?.forEach((subCategory) => {
      const subName = subCategory.name || subCategory.id.split("/").pop() || subCategory.id;
      pairs.push({
        topCategory: topName,
        subCategory: subName,
      });
    });
  });

  return pairs;
}

function buildHierarchyFromPairs(pairs: TopSubCategoryPair[]): ItemCategory[] {
  const topMap = new Map<string, Set<string>>();

  pairs.forEach(({ topCategory, subCategory }) => {
    if (!topMap.has(topCategory)) {
      topMap.set(topCategory, new Set<string>());
    }
    topMap.get(topCategory)!.add(subCategory);
  });

  const topCategories: ItemCategory[] = Array.from(topMap.entries()).map(
    ([topCategory, subCategories]) => ({
      id: topCategory,
      name: topCategory,
      children: Array.from(subCategories).map((subCategory) => ({
        id: `${topCategory}/${subCategory}`,
        name: subCategory,
      })),
    }),
  );

  return [
    {
      id: "all",
      name: "전체",
      children: topCategories,
    },
  ];
}

export function mergeCategoriesWithFallback(
  apiCategories: ItemCategory[],
): ItemCategory[] {
  const apiPairs = toTopSubPairs(apiCategories);
  if (apiPairs.length === 0) {
    return itemCategories;
  }

  const fallbackMap = new Map<string, Set<string>>();
  const apiMap = new Map<string, Set<string>>();

  ITEM_CATEGORY_ENUM_PAIRS.forEach(({ topCategory, subCategory }) => {
    if (!fallbackMap.has(topCategory)) {
      fallbackMap.set(topCategory, new Set<string>());
    }
    fallbackMap.get(topCategory)!.add(subCategory);
  });

  apiPairs.forEach(({ topCategory, subCategory }) => {
    if (!apiMap.has(topCategory)) {
      apiMap.set(topCategory, new Set<string>());
    }
    apiMap.get(topCategory)!.add(subCategory);
  });

  const topOrder = [
    ...fallbackMap.keys(),
    ...Array.from(apiMap.keys()).filter((topCategory) => !fallbackMap.has(topCategory)),
  ];

  const mergedPairs: TopSubCategoryPair[] = [];

  topOrder.forEach((topCategory) => {
    const fallbackSubs = fallbackMap.get(topCategory) || new Set<string>();
    const apiSubs = apiMap.get(topCategory) || new Set<string>();

    const subOrder = [
      ...fallbackSubs,
      ...Array.from(apiSubs).filter((subCategory) => !fallbackSubs.has(subCategory)),
    ];

    subOrder.forEach((subCategory) => {
      mergedPairs.push({ topCategory, subCategory });
    });
  });

  return buildHierarchyFromPairs(mergedPairs);
}

export const itemCategories: ItemCategory[] =
  buildHierarchyFromPairs(ITEM_CATEGORY_ENUM_PAIRS);
