import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  ItemInfoResponse,
  ItemInfoSearchParams,
  PageResponse,
} from "@/types/item-info";

interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
}

async function fetchItemInfoDetail(
  params: ItemInfoSearchParams,
): Promise<PageResponse<ItemInfoResponse>> {
  const searchParams = new URLSearchParams();

  searchParams.set("topCategory", params.topCategory);
  if (params.subCategory) searchParams.set("subCategory", params.subCategory);
  if (params.name) searchParams.set("name", params.name);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.size) searchParams.set("size", params.size.toString());
  if (params.direction) searchParams.set("direction", params.direction);

  const response = await fetch(`/api/item-infos/detail?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch item info detail");
  }

  const result: ApiResponse<PageResponse<ItemInfoResponse>> = await response.json();

  if (!result.success) {
    throw new Error(result.message || "API 요청 실패");
  }

  return result.data;
}

export function useItemInfoDetail(params: ItemInfoSearchParams | null) {
  return useQuery({
    queryKey: ["itemInfoDetail", params],
    queryFn: () => fetchItemInfoDetail(params!),
    enabled: !!params?.topCategory,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 30 * 60 * 1000, // 30분
    placeholderData: keepPreviousData,
  });
}
