import { NextRequest, NextResponse } from "next/server";

import { selectServerGatewayUrl } from "@/lib/api/gateway-selector";
import { MEDIA_UPLOAD_TIMEOUT_MS } from "@/lib/api/timeouts";

const OUTFIT_PAYLOAD_TOO_LARGE_MESSAGE =
  "사진 용량이 너무 커요. 사진은 최대 5장, 각 5MiB까지 등록할 수 있어요.";

function isTimeoutError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  );
}

export async function proxyOutfit(
  request: NextRequest,
  segments: string[] = [],
) {
  if (segments.some((segment) => !/^[a-zA-Z0-9-]+$/.test(segment)))
    return NextResponse.json(
      { success: false, message: "잘못된 경로입니다." },
      { status: 400 },
    );
  try {
    const upstream = new URL(
      `/dcs/api/outfits${segments.length ? "/" + segments.join("/") : ""}`,
      selectServerGatewayUrl(),
    );
    upstream.search = new URL(request.url).search;
    const headers = new Headers();
    const cookie = request.headers.get("cookie") ?? "";
    const token = cookie.match(/(?:^|;\s*)access_token=([^;]+)/)?.[1];
    const auth =
      request.headers.get("authorization") ??
      (token ? `Bearer ${token}` : null);
    const publicImage =
      request.method === "GET" &&
      segments.length === 3 &&
      segments[1] === "images";
    if (auth && !publicImage) headers.set("authorization", auth);
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);
    const hasBody = !["GET", "HEAD"].includes(request.method);
    const response = await fetch(upstream, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      duplex: "half",
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(MEDIA_UPLOAD_TIMEOUT_MS),
    } as RequestInit & { duplex: "half" });
    if (response.status === 413) {
      return NextResponse.json(
        {
          success: false,
          code: "OUTFIT_PAYLOAD_TOO_LARGE",
          message: OUTFIT_PAYLOAD_TOO_LARGE_MESSAGE,
        },
        { status: 413, headers: { "cache-control": "no-store" } },
      );
    }
    const responseHeaders = new Headers({ "cache-control": "no-store" });
    const location = response.headers.get("location");
    // Next's internal image optimizer consumes bytes; it does not follow a local 302.
    if (publicImage && location && response.status === 302) {
      const target = new URL(location);
      if (!["http:", "https:"].includes(target.protocol))
        throw new Error("Invalid image URL");
      const image = await fetch(target, {
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(MEDIA_UPLOAD_TIMEOUT_MS),
      });
      const type = image.headers.get("content-type") ?? "";
      if (!image.ok || !/^image\/(jpeg|png|webp|gif)(;|$)/i.test(type)) {
        return NextResponse.json(
          { success: false, message: "사진을 불러오지 못했어요." },
          { status: image.status === 404 ? 404 : 502 },
        );
      }
      return new NextResponse(image.body, {
        status: 200,
        headers: {
          "content-type": type,
          "cache-control": "no-store",
          "x-content-type-options": "nosniff",
        },
      });
    }
    if (location && [302, 303, 307, 308].includes(response.status))
      responseHeaders.set("location", location);
    responseHeaders.set(
      "content-type",
      response.headers.get("content-type") ?? "application/json",
    );
    return new NextResponse(response.status === 204 ? null : response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const timedOut = isTimeoutError(error);
    return NextResponse.json(
      {
        success: false,
        code: timedOut
          ? "OUTFIT_UPLOAD_TIMEOUT"
          : "OUTFIT_UPSTREAM_UNAVAILABLE",
        message: timedOut
          ? "사진 업로드 시간이 초과됐어요. 네트워크를 확인한 뒤 다시 시도해 주세요."
          : "의장 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.",
      },
      {
        status: timedOut ? 504 : 503,
        headers: { "cache-control": "no-store" },
      },
    );
  }
}
