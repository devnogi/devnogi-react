import { useQuery } from "@tanstack/react-query";
import { ItemInfoCategory } from "@/types/item-info";
import {
  ItemCategory,
  itemCategories,
  mergeCategoriesWithFallback,
} from "@/data/item-category";

interface CategoryApiResponse {
  topCategory: string;
  subCategory: string;
}

interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

function extractTopCategories(categories: ItemCategory[]): ItemCategory[] {
  const allNode = categories.find(
    (category) => category.id === "all" && category.children && category.children.length > 0,
  );

  if (allNode?.children) {
    return allNode.children;
  }

  return categories.filter((category) => category.id !== "all");
}

function toItemInfoCategories(categories: ItemCategory[]): ItemInfoCategory[] {
  return extractTopCategories(categories)
    .map((category) => ({
      topCategory: category.name || category.id,
      subCategories: (category.children || [])
        .map((subCategory) => subCategory.name || subCategory.id.split("/").pop() || subCategory.id)
        .filter(Boolean),
    }))
    .filter((category) => category.subCategories.length > 0);
}

// 타임아웃이 있는 fetch
async function fetchWithTimeout(
  url: string,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// retry 로직을 포함한 fetch (3번 시도, 타임아웃 5초씩 증가: 5초, 10초, 15초)
async function fetchWithRetry(url: string, maxRetries: number = 3): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const timeout = (attempt + 1) * 5000;
    try {
      return await fetchWithTimeout(url, timeout);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError || new Error("Failed after retries");
}

function buildCategoryTree(categories: ItemInfoCategory[]): ItemCategory[] {
  return [
    {
      id: "all",
      name: "전체",
      children: categories.map((category) => ({
        id: category.topCategory,
        name: category.topCategory,
        children: category.subCategories.map((subCategory) => ({
          id: `${category.topCategory}/${subCategory}`,
          name: subCategory,
        })),
      })),
    },
  ];
}

async function fetchItemInfoCategories(): Promise<ItemInfoCategory[]> {
  const response = await fetchWithRetry("/api/item-infos/categories", 3);

  if (!response.ok) {
    throw new Error("Failed to fetch item info categories");
  }

  const result: ApiResponse<CategoryApiResponse[]> = await response.json();

  if (!result.success) {
    throw new Error(result.message || "API 요청 실패");
  }

  // topCategory별로 그룹화
  const categoryMap = new Map<string, string[]>();

  result.data.forEach(({ topCategory, subCategory }) => {
    const existing = categoryMap.get(topCategory) || [];
    if (!existing.includes(subCategory)) {
      existing.push(subCategory);
    }
    categoryMap.set(topCategory, existing);
  });

  const categoriesFromApi: ItemInfoCategory[] = Array.from(categoryMap.entries()).map(([topCategory, subCategories]) => ({
    topCategory,
    subCategories,
  }));

  const merged = mergeCategoriesWithFallback(buildCategoryTree(categoriesFromApi));
  return toItemInfoCategories(merged);
}

export function useItemInfoCategories() {
  const fallbackCategories = toItemInfoCategories(itemCategories);

  return useQuery({
    queryKey: ["itemInfoCategories"],
    queryFn: async () => {
      try {
        return await fetchItemInfoCategories();
      } catch (error) {
        console.error("Falling back to enum categories:", error);
        return fallbackCategories;
      }
    },
    placeholderData: fallbackCategories,
    staleTime: 6 * 60 * 60 * 1000, // 6시간
    gcTime: 12 * 60 * 60 * 1000, // 12시간
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });
}
