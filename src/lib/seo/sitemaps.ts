import { itemPath } from "@/lib/items/identity";

import { publicJson } from "./public-api";
import { canonicalUrl, PUBLIC_SITEMAP_PATHS } from "./site";

type Kind = "posts" | "outfits" | "items";
type Entry = {
  id?: number;
  updatedAt?: string | null;
  name?: string;
  topCategory?: string;
  subCategory?: string;
};
interface Projection {
  items: Entry[];
  nextCursor: string | null;
  hasNext: boolean;
}
const sources: Record<Kind, string> = {
  posts: "/dcs/api/posts/sitemap",
  outfits: "/dcs/api/outfits/sitemap",
  items: "/oab/api/item-infos/sitemap",
};
const ttl = 300_000;
const cache = new Map<string, { xml: string; expires: number }>();
const pending = new Map<string, Promise<string>>();
const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';

function escape(value: string) {
  return value.replace(
    /[<>&"']/g,
    (character) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[character]!,
  );
}

function validCursor(kind: Kind, cursor: string) {
  if (!cursor) return true;
  if (kind !== "items")
    return /^[1-9]\d*$/.test(cursor) && Number.isSafeInteger(Number(cursor));
  if (cursor.length > 2048 || !/^[\w-]+$/.test(cursor)) return false;
  try {
    const text = Buffer.from(cursor, "base64url").toString("utf8");
    const parts: unknown = JSON.parse(text);
    return (
      Buffer.from(text).toString("base64url") === cursor &&
      Array.isArray(parts) &&
      parts.length === 3 &&
      parts.every(
        (part, index) =>
          typeof part === "string" &&
          part.trim().length > 0 &&
          [...part].length <= (index === 0 ? 255 : 25),
      )
    );
  } catch {
    return false;
  }
}

async function projection(kind: Kind, cursor: string): Promise<Projection> {
  const params = new URLSearchParams({ limit: "1000" });
  if (cursor) params.set("cursor", cursor);
  const data = await publicJson<Projection>(`${sources[kind]}?${params}`);
  if (
    !Array.isArray(data?.items) ||
    data.items.length > 1000 ||
    typeof data.hasNext !== "boolean" ||
    (data.hasNext
      ? !data.nextCursor ||
        !validCursor(kind, data.nextCursor) ||
        !data.items.length
      : data.nextCursor !== null)
  ) {
    throw new Error("Invalid sitemap projection");
  }
  const identities = new Set<string>();
  let previousId = Number(cursor || 0);
  for (const entry of data.items) {
    if (kind === "items") {
      if (
        typeof entry.name !== "string" ||
        typeof entry.topCategory !== "string" ||
        typeof entry.subCategory !== "string" ||
        !entry.name.trim() ||
        !entry.topCategory.trim() ||
        !entry.subCategory.trim()
      )
        throw new Error("Invalid item projection");
      const identity = JSON.stringify([
        entry.name,
        entry.topCategory,
        entry.subCategory,
      ]);
      if (identities.has(identity)) throw new Error("Duplicate sitemap item");
      identities.add(identity);
    } else {
      if (
        !Number.isSafeInteger(entry.id) ||
        entry.id! <= previousId ||
        (entry.updatedAt != null &&
          (typeof entry.updatedAt !== "string" ||
            !Number.isFinite(Date.parse(entry.updatedAt))))
      ) {
        throw new Error("Invalid public content projection");
      }
      previousId = entry.id!;
    }
  }
  if (data.hasNext) {
    const last = data.items.at(-1)!;
    const expected =
      kind === "items"
        ? Buffer.from(
            JSON.stringify([last.name, last.topCategory, last.subCategory]),
          ).toString("base64url")
        : String(last.id);
    if (data.nextCursor !== expected || data.nextCursor === cursor)
      throw new Error("Invalid sitemap continuation");
  }
  return data;
}

function childUrl(kind: Kind, cursor: string) {
  return canonicalUrl(
    `/sitemap-${kind}.xml${cursor ? `?${new URLSearchParams({ cursor })}` : ""}`,
  );
}

async function indexXml() {
  const groups = await Promise.all(
    (Object.keys(sources) as Kind[]).map(async (kind) => {
      const urls: string[] = [];
      const seen = new Set<string>();
      let cursor = "";
      do {
        if (seen.has(cursor) || seen.size >= 16_000)
          throw new Error("Sitemap traversal limit exceeded");
        seen.add(cursor);
        const page = await projection(kind, cursor);
        urls.push(childUrl(kind, cursor));
        if (!page.hasNext) break;
        cursor = page.nextCursor!;
      } while (true);
      return urls;
    }),
  );
  return `${xmlHeader}<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[canonicalUrl("/sitemap-static.xml"), ...groups.flat()].map((url) => `<sitemap><loc>${escape(url)}</loc></sitemap>`).join("")}</sitemapindex>`;
}

function urlset(entries: Array<{ url: string; modified?: string | null }>) {
  return `${xmlHeader}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map((entry) => `<url><loc>${escape(entry.url)}</loc>${entry.modified ? `<lastmod>${escape(entry.modified)}</lastmod>` : ""}</url>`).join("")}</urlset>`;
}

async function build(kind: Kind | "index" | "static", cursor: string) {
  if (kind === "index") return indexXml();
  if (kind === "static")
    return urlset(
      PUBLIC_SITEMAP_PATHS.map((path) => ({ url: canonicalUrl(path) })),
    );
  const data = await projection(kind, cursor);
  return urlset(
    data.items.map((entry) => ({
      url: canonicalUrl(
        kind === "items"
          ? itemPath({
              name: entry.name!,
              topCategory: entry.topCategory!,
              subCategory: entry.subCategory!,
            })
          : `/${kind === "posts" ? "community" : "outfits"}/${entry.id}`,
      ),
      modified: kind === "items" ? undefined : entry.updatedAt,
    })),
  );
}

export async function sitemapResponse(
  kind: Kind | "index" | "static",
  request: Request,
): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const cursor = params.get("cursor") ?? "";
  if (
    [...params.keys()].some((key) => key !== "cursor") ||
    params.getAll("cursor").length > 1 ||
    (kind === "index" || kind === "static"
      ? params.size > 0
      : !validCursor(kind, cursor))
  ) {
    return new Response("Invalid sitemap cursor", { status: 400 });
  }
  const key = `${kind}:${cursor}`;
  try {
    let entry = cache.get(key);
    if (!entry || entry.expires <= Date.now()) {
      let task = pending.get(key);
      if (!task) {
        task = build(kind, cursor);
        pending.set(key, task);
      }
      try {
        const xml = await task;
        entry = { xml, expires: Date.now() + ttl };
        if (cache.size >= 128) cache.delete(cache.keys().next().value!);
        cache.set(key, entry);
      } finally {
        pending.delete(key);
      }
    }
    return new Response(entry.xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch {
    return new Response("Sitemap temporarily unavailable", {
      status: 503,
      headers: { "Retry-After": "60", "Cache-Control": "no-store" },
    });
  }
}
