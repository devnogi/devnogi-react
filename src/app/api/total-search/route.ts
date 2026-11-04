import { NextRequest, NextResponse } from "next/server";

import { createServerAxios } from "@/lib/api/server";
import {
  UnifiedSearchItem,
  UnifiedSearchSource,
  UnifiedSearchType,
} from "@/types/unified-search";

interface UpstreamEnvelope<T> {
  data: T;
}

interface BatchSearchItem {
  type: "ITEM" | "MENU";
  keyword: string;
  targetKey: string;
}

interface UserSearchItem {
  type: "USER";
  userId: number;
  nickname: string;
  serverName: string | null;
}

const TYPE_PRIORITY: Record<UnifiedSearchType, number> = {
  MENU: 0,
  ITEM: 1,
  USER: 2,
};

function matchPriority(label: string, query: string): number {
  const normalized = label.toLocaleLowerCase("ko-KR");
  if (normalized === query) return 0;
  if (normalized.startsWith(query)) return 1;
  return 2;
}

function sortResults(
  items: UnifiedSearchItem[],
  query: string,
): UnifiedSearchItem[] {
  const normalizedQuery = query.toLocaleLowerCase("ko-KR");
  return items
    .filter((item) =>
      item.label.toLocaleLowerCase("ko-KR").includes(normalizedQuery),
    )
    .sort((left, right) => {
      const matchDifference =
        matchPriority(left.label, normalizedQuery) -
        matchPriority(right.label, normalizedQuery);
      if (matchDifference !== 0) return matchDifference;
      const typeDifference =
        TYPE_PRIORITY[left.type] - TYPE_PRIORITY[right.type];
      if (typeDifference !== 0) return typeDifference;
      const labelDifference = left.label.localeCompare(right.label, "ko-KR");
      if (labelDifference !== 0) return labelDifference;
      return left.targetKey.localeCompare(right.targetKey, "ko-KR");
    })
    .slice(0, 10);
}

function successResponse(
  data: UnifiedSearchItem[],
  partialFailures: UnifiedSearchSource[],
) {
  return NextResponse.json(
    {
      success: true,
      data,
      partialFailures,
      timestamp: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";
  if (!query) return successResponse([], []);

  const serverAxios = createServerAxios(request);
  const params = { query, limit: 10 };
  const [batchResult, authResult] = await Promise.allSettled([
    serverAxios.get<UpstreamEnvelope<BatchSearchItem[]>>(
      "/oab/api/total-search",
      { params },
    ),
    serverAxios.get<UpstreamEnvelope<UserSearchItem[]>>(
      "/das/api/user/search",
      { params },
    ),
  ]);

  const partialFailures: UnifiedSearchSource[] = [];
  const results: UnifiedSearchItem[] = [];
  if (batchResult.status === "fulfilled") {
    results.push(
      ...batchResult.value.data.data.map((item) => ({
        type: item.type,
        label: item.keyword,
        targetKey: item.targetKey,
      })),
    );
  } else {
    partialFailures.push("BATCH");
  }

  if (authResult.status === "fulfilled") {
    results.push(
      ...authResult.value.data.data.map((item) => ({
        type: item.type,
        label: item.nickname,
        targetKey: String(item.userId),
        userId: item.userId,
        serverName: item.serverName,
      })),
    );
  } else {
    partialFailures.push("AUTH");
  }

  if (partialFailures.length === 2) {
    return NextResponse.json(
      {
        success: false,
        data: [],
        partialFailures,
        message: "통합 검색 서비스를 사용할 수 없습니다.",
        timestamp: new Date().toISOString(),
      },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }

  return successResponse(sortResults(results, query), partialFailures);
}
