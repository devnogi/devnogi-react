import type {
  HornBugleResponse,
  HornBugleSearchParams,
} from "@/types/horn-bugle";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseHornBugleResponse(payload: unknown): HornBugleResponse {
  if (
    !isRecord(payload) ||
    payload.success !== true ||
    !isRecord(payload.data)
  ) {
    throw new Error("뿔피리 응답을 확인하지 못했습니다.");
  }
  const { items, meta } = payload.data;
  if (
    !Array.isArray(items) ||
    !items.every(
      (item) =>
        isRecord(item) &&
        Number.isSafeInteger(item.id) &&
        Number(item.id) > 0 &&
        [
          "serverName",
          "characterName",
          "message",
          "dateSend",
          "dateRegister",
        ].every((field) => typeof item[field] === "string"),
    ) ||
    !isRecord(meta) ||
    !["currentPage", "pageSize", "totalPages", "totalElements"].every(
      (field) => Number.isSafeInteger(meta[field]) && Number(meta[field]) >= 0,
    ) ||
    Number(meta.currentPage) < 1 ||
    Number(meta.pageSize) < 1 ||
    typeof meta.isFirst !== "boolean" ||
    typeof meta.isLast !== "boolean"
  ) {
    throw new Error("뿔피리 응답 형식이 올바르지 않습니다.");
  }
  return payload.data as unknown as HornBugleResponse;
}

export async function fetchHornBugle(
  params: HornBugleSearchParams,
  signal?: AbortSignal,
): Promise<HornBugleResponse> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const response = await fetch(`/api/horn-bugle?${query}`, {
    signal,
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`뿔피리 조회 실패: ${response.status}`);
  const data = parseHornBugleResponse(await response.json());
  signal?.throwIfAborted();
  return data;
}
