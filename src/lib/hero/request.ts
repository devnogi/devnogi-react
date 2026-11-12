import { isAxiosError } from "axios";

import { clientAxios } from "@/lib/api/clients";
import { MEDIA_UPLOAD_TIMEOUT_MS } from "@/lib/api/timeouts";

export async function heroRequest<T>(
  path: string,
  method = "GET",
  payload?: unknown,
): Promise<T> {
  try {
    const options = {
      url: "/" + path,
      method,
      data: payload,
      headers: method === "GET" ? undefined : { "X-Hero-Action": "1" },
      withCredentials: true,
      skipAuthRefresh: path.startsWith("hero") && method === "GET",
      ...(payload instanceof FormData
        ? { timeout: MEDIA_UPLOAD_TIMEOUT_MS }
        : {}),
    };
    const { data, status } = await clientAxios.request(options);
    if (status === 204) return undefined as T;
    if (data?.success !== true)
      throw new Error(data?.message || "광고 요청을 처리하지 못했습니다.");
    return data.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.message)
      throw new Error(error.response.data.message);
    throw error;
  }
}
