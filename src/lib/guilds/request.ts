import { isAxiosError } from "axios";

import { clientAxios } from "@/lib/api/clients";
import { MEDIA_UPLOAD_TIMEOUT_MS } from "@/lib/api/timeouts";

export async function guildRequest<T>(
  path: string,
  method = "GET",
  payload?: unknown,
  anonymous = false,
): Promise<T> {
  const options = {
    url: "/" + path,
    method,
    data: payload,
    withCredentials: true,
    headers: method === "GET" ? undefined : { "X-Guild-Action": "1" },
    ...(payload instanceof FormData
      ? { timeout: MEDIA_UPLOAD_TIMEOUT_MS }
      : {}),
    skipAuthRefresh: anonymous && method === "GET",
  };
  try {
    const { data, status } = await clientAxios.request(options);
    if (status === 204 || data == null || data === "") return undefined as T;
    if (data.success === false)
      throw new Error(data.message || "길드 요청을 처리하지 못했습니다.");
    return data.success === true ? data.data : data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.message)
      throw new Error(error.response.data.message);
    throw error;
  }
}
