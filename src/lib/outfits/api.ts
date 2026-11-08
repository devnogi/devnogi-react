import { isAxiosError } from "axios";

import { clientAxios } from "@/lib/api/clients";
import { MEDIA_UPLOAD_TIMEOUT_MS } from "@/lib/api/timeouts";

interface OutfitErrorPayload {
  code?: string;
  message?: string;
}

const OUTFIT_ERROR_MESSAGES: Record<string | number, string> = {
  413: "사진 용량이 너무 커요. 사진은 최대 5장, 각 5MiB까지 등록할 수 있어요.",
  503: "의장 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.",
  504: "사진 업로드 시간이 초과됐어요. 네트워크를 확인한 뒤 다시 시도해 주세요.",
  OUTFIT_PAYLOAD_TOO_LARGE:
    "사진 용량이 너무 커요. 사진은 최대 5장, 각 5MiB까지 등록할 수 있어요.",
  OUTFIT_UPLOAD_TIMEOUT:
    "사진 업로드 시간이 초과됐어요. 네트워크를 확인한 뒤 다시 시도해 주세요.",
  OUTFIT_UPSTREAM_UNAVAILABLE:
    "의장 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.",
};
const OUTFIT_CLIENT_TIMEOUT_MS = MEDIA_UPLOAD_TIMEOUT_MS + 10_000;

function getOutfitErrorMessage(error: unknown): string | undefined {
  if (!isAxiosError(error)) return undefined;
  if (
    !error.response &&
    (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT")
  )
    return OUTFIT_ERROR_MESSAGES.OUTFIT_UPLOAD_TIMEOUT;

  const payload =
    error.response?.data && typeof error.response.data === "object"
      ? (error.response.data as OutfitErrorPayload)
      : undefined;
  return (
    (payload?.code && OUTFIT_ERROR_MESSAGES[payload.code]) ||
    (error.response?.status && OUTFIT_ERROR_MESSAGES[error.response.status]) ||
    payload?.message
  );
}

export async function outfitRequest<T>(
  path = "",
  init?: RequestInit,
): Promise<T> {
  try {
    const response = await clientAxios.request({
      url: `/outfits${path}`,
      method: init?.method ?? "GET",
      data: init?.body,
      headers: Object.fromEntries(new Headers(init?.headers)),
      signal: init?.signal ?? undefined,
      timeout: OUTFIT_CLIENT_TIMEOUT_MS,
      withCredentials: true,
    });
    if (response.status === 204) return undefined as T;
    if (response.data.success === false)
      throw new Error(
        response.data.message || "의장 정보를 불러오지 못했어요.",
      );
    return response.data.data as T;
  } catch (error) {
    const message = getOutfitErrorMessage(error);
    if (message) throw new Error(message);
    throw error;
  }
}
export const outfitJson = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});
