import { NextRequest, NextResponse } from "next/server";

import { selectServerGatewayUrl } from "@/lib/api/gateway-selector";
import { MEDIA_UPLOAD_TIMEOUT_MS } from "@/lib/api/timeouts";

export async function proxyGuild(
  request: NextRequest,
  segments: string[],
  admin = false,
) {
  const headers = { "cache-control": "private, no-store" };
  const writes = !["GET", "HEAD"].includes(request.method);
  if (
    writes &&
    (request.headers.get("x-guild-action") !== "1" ||
      ["cross-site", "same-site"].includes(
        request.headers.get("sec-fetch-site") ?? "",
      ) ||
      request.headers.get("origin") === "null")
  ) {
    return NextResponse.json(
      { message: "길드 화면에서 다시 시도해 주세요." },
      { status: 403, headers },
    );
  }
  if (segments.some((part) => !/^[a-zA-Z0-9-]+$/.test(part))) {
    return NextResponse.json(
      { message: "잘못된 길드 경로입니다." },
      { status: 400, headers },
    );
  }
  try {
    const prefix = admin ? "/dcs/api/admin/guilds" : "/dcs/api/guilds";
    const target = new URL(
      [prefix, ...segments].join("/"),
      selectServerGatewayUrl(),
    );
    target.search = request.nextUrl.search;
    const upstreamHeaders = new Headers();
    if (writes) upstreamHeaders.set("x-guild-action", "1");
    const token = request.cookies.get("access_token")?.value;
    const authorization =
      request.headers.get("authorization") ??
      (token ? `Bearer ${token}` : null);
    if (authorization) upstreamHeaders.set("authorization", authorization);
    const type = request.headers.get("content-type");
    if (type) upstreamHeaders.set("content-type", type);

    const result = await fetch(target, {
      method: request.method,
      headers: upstreamHeaders,
      body: request.body,
      duplex: "half",
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(MEDIA_UPLOAD_TIMEOUT_MS),
    } as RequestInit & { duplex: "half" });
    return new NextResponse(result.body, {
      status: result.status,
      headers: {
        ...headers,
        "content-type":
          result.headers.get("content-type") ?? "application/json",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "길드 서버에 연결할 수 없습니다." },
      { status: 503, headers },
    );
  }
}
