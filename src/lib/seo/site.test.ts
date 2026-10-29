import {
  canonicalUrl,
  createPageMetadata,
  DEFAULT_DESCRIPTION,
  PUBLIC_SITEMAP_PATHS,
  SITE_NAME,
  SITE_ORIGIN,
} from "@/lib/seo/site";

describe("SEO site configuration", () => {
  it("uses the public www origin for canonical URLs", () => {
    expect(SITE_ORIGIN.toString()).toBe("https://www.memonogi.com/");
    expect(canonicalUrl("/auction-history")).toBe(
      "https://www.memonogi.com/auction-history",
    );
  });

  it("keeps only public, query-free paths in the sitemap inventory", () => {
    expect(PUBLIC_SITEMAP_PATHS).toContain("/");
    expect(PUBLIC_SITEMAP_PATHS).not.toContain("/admin");
    expect(PUBLIC_SITEMAP_PATHS.every((path) => !path.includes("?"))).toBe(
      true,
    );
  });

  it("creates canonical, social, and robots metadata from one page definition", () => {
    const metadata = createPageMetadata({
      title: "경매장 거래내역",
      description: DEFAULT_DESCRIPTION,
      pathname: "/auction-history",
      robots: { index: false, follow: false },
    });

    expect(metadata.alternates?.canonical).toBe("/auction-history");
    expect(metadata.openGraph).toMatchObject({
      siteName: SITE_NAME,
      url: "/auction-history",
    });
    expect(metadata.twitter).toMatchObject({ card: "summary" });
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
