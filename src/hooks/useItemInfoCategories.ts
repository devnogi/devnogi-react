import { useQuery } from "@tanstack/react-query";
import { ItemInfoCategory } from "@/types/item-info";

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

async function fetchItemInfoCategories(): Promise<ItemInfoCategory[]> {
  const response = await fetch("/api/item-infos/categories");

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

  return Array.from(categoryMap.entries()).map(([topCategory, subCategories]) => ({
    topCategory,
    subCategories: subCategories.sort(),
  }));
}

export function useItemInfoCategories() {
  return useQuery({
    queryKey: ["itemInfoCategories"],
    queryFn: fetchItemInfoCategories,
    staleTime: 6 * 60 * 60 * 1000, // 6시간
    gcTime: 12 * 60 * 60 * 1000, // 12시간
  });
}
