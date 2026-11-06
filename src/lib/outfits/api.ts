import { isAxiosError } from "axios";

import { clientAxios } from "@/lib/api/clients";
import { MEDIA_UPLOAD_TIMEOUT_MS } from "@/lib/api/timeouts";
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
      timeout: MEDIA_UPLOAD_TIMEOUT_MS,
      withCredentials: true,
    });
    if (response.status === 204) return undefined as T;
    if (response.data.success === false)
      throw new Error(
        response.data.message || "의장 정보를 불러오지 못했어요.",
      );
    return response.data.data as T;
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.message)
      throw new Error(error.response.data.message);
    throw error;
  }
}
export const outfitJson = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});
