import { selectServerGatewayUrl } from "@/lib/api/gateway-selector";

export class PublicApiError extends Error {
  constructor(public readonly status: number) {
    super(`Public content request failed (${status})`);
  }
}

/** Public rendering must not inherit a visitor's session or cache private data. */
export async function publicJson<T>(
  path: string,
  { timeoutMs = 5000 }: { timeoutMs?: 5000 | 20000 } = {},
): Promise<T> {
  const response = await fetch(new URL(path, selectServerGatewayUrl()), {
    cache: "no-store",
    credentials: "omit",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new PublicApiError(response.status);
  const payload = await response.json();
  if (payload && typeof payload === "object" && "success" in payload) {
    if (!payload.success || payload.data == null) throw new PublicApiError(502);
    return payload.data as T;
  }
  return payload as T;
}
