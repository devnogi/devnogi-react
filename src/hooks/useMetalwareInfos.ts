"use client";

import { useQuery } from "@tanstack/react-query";

interface MetalwareInfoResponse {
  metalware: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

async function fetchMetalwareInfos(): Promise<string[]> {
  const response = await fetch("/api/metalware-infos");

  if (!response.ok) {
    throw new Error(`Failed to fetch metalware infos: ${response.status}`);
  }

  const apiResponse: ApiResponse<MetalwareInfoResponse[]> =
    await response.json();

  if (!apiResponse.success) {
    throw new Error(apiResponse.message || "세공 정보 조회 실패");
  }

  return (apiResponse.data || []).map((item) => item.metalware);
}

export function useMetalwareInfos() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["metalware-infos"],
    queryFn: fetchMetalwareInfos,
    staleTime: 60 * 60 * 1000, // 1시간
    gcTime: 2 * 60 * 60 * 1000, // 2시간
  });

  return {
    metalwareList: data ?? [],
    isLoading,
    error,
  };
}
