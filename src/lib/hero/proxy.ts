import { NextRequest, NextResponse } from "next/server";

import { selectServerGatewayUrl } from "@/lib/api/gateway-selector";
import { MEDIA_UPLOAD_TIMEOUT_MS } from "@/lib/api/timeouts";

function hasSameRequestOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const protocol =
    request.headers.get("x-forwarded-proto") ??
    request.nextUrl.protocol.replace(/:$/, "");
  if (
    !origin ||
    !host ||
    /[\s,/@\\?#]/.test(host) ||
    !["http", "https"].includes(protocol)
  )
    return false;
  try {
    const source = new URL(origin);
    // NextURL rewrites loopback addresses and may use the internal server host.
    // Compare the browser Origin with the HTTP Host; never trust forwarded-host.
    return (
      source.origin === origin &&
      source.origin === new URL(`${protocol}://${host}`).origin
    );
  } catch {
    return false;
  }
}

export async function proxyHero(
  request: NextRequest,
  segments: string[],
  scope: "public" | "user" | "admin",
) {
  const headers = {
    "cache-control": "private, no-store",
    "x-content-type-options": "nosniff",
  };
  const writes = !["GET", "HEAD"].includes(request.method);
  if (
    writes &&
    (request.headers.get("x-hero-action") !== "1" ||
      !hasSameRequestOrigin(request) ||
      ["cross-site", "same-site"].includes(
        request.headers.get("sec-fetch-site") ?? "",
      ))
  ) {
    return NextResponse.json(
      { success: false, message: "광고 화면에서 다시 시도해주세요." },
      { status: 403, headers },
    );
  }
  if (
    (scope === "public" && writes) ||
    segments.some((part) => !/^[a-zA-Z0-9-]+$/.test(part))
  ) {
    return NextResponse.json(
      { success: false, message: "잘못된 광고 요청입니다." },
      { status: 400, headers },
    );
  }
  try {
    const prefix =
      scope === "public" ? "/das/api/hero" : `/das/api/${scope}/hero`;
    const target = new URL(
      [prefix, ...segments].join("/"),
      selectServerGatewayUrl(),
    );
    target.search = request.nextUrl.search;
    const upstream = new Headers();
    const token = request.cookies.get("access_token")?.value;
    if (scope !== "public" && token)
      upstream.set("cookie", `access_token=${token}`);
    if (writes) upstream.set("x-hero-action", "1");
    const type = request.headers.get("content-type");
    if (type) upstream.set("content-type", type);
    const result = await fetch(target, {
      method: request.method,
      headers: upstream,
      body: writes ? request.body : undefined,
      duplex: "half",
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(MEDIA_UPLOAD_TIMEOUT_MS),
    } as RequestInit & { duplex: "half" });
    if (
      result.status !== 204 &&
      !result.headers.get("content-type")?.includes("application/json")
    )
      return NextResponse.json(
        { success: false, message: "광고 서버의 응답을 확인할 수 없습니다." },
        { status: 502, headers },
      );
    return new NextResponse(result.body, {
      status: result.status,
      headers: { ...headers, "content-type": "application/json" },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "광고 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
      },
      { status: 503, headers },
    );
  }
}
