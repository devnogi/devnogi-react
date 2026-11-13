import { canonicalUrl, SITE_NAME } from "./site";

export function jsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function breadcrumbs(entries: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: SITE_NAME, path: "/" }, ...entries].map(
      (entry, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: entry.name,
        item: canonicalUrl(entry.path),
      }),
    ),
  };
}
