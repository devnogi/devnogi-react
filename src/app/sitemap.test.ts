async function setup() {
  jest.resetModules();
  const get = jest.fn();
  jest.doMock("@/lib/seo/public-api", () => ({ publicJson: get }));
  const { sitemapResponse } = await import("@/lib/seo/sitemaps");
  return { get, sitemapResponse };
}
const request = (path: string) =>
  new Request(`https://www.memonogi.com${path}`);
const empty = { items: [], nextCursor: null, hasNext: false };

describe("public sitemap XML", () => {
  afterEach(() => jest.restoreAllMocks());

  it("keeps public landing URLs and excludes private/search routes", async () => {
    const { get, sitemapResponse } = await setup();
    const response = await sitemapResponse(
      "static",
      request("/sitemap-static.xml"),
    );
    const xml = await response.text();
    expect(xml.match(/<url>/g)).toHaveLength(9);
    expect(xml).toContain("https://www.memonogi.com/community");
    expect(xml).toContain("https://www.memonogi.com/outfits");
    expect(xml).not.toMatch(/mypage|write|sign-in|lastmod/);
    expect(get).not.toHaveBeenCalled();
  });

  it("discovers every starting cursor using bounded projections", async () => {
    const { get, sitemapResponse } = await setup();
    get.mockImplementation(async (path: string) => {
      if (!path.includes("/posts/")) return empty;
      return path.includes("cursor=1")
        ? {
            items: [{ id: 2, updatedAt: null }],
            nextCursor: null,
            hasNext: false,
          }
        : {
            items: [{ id: 1, updatedAt: "2026-11-13T01:00:00Z" }],
            nextCursor: "1",
            hasNext: true,
          };
    });
    const xml = await (
      await sitemapResponse("index", request("/sitemap.xml"))
    ).text();
    expect(xml).toContain("<sitemapindex");
    expect(xml).toContain("/sitemap-posts.xml?cursor=1");
    expect(xml.match(/<sitemap>/g)).toHaveLength(5);
    expect(get).toHaveBeenCalledTimes(4);
    for (const [path] of get.mock.calls) expect(path).toContain("limit=1000");
  });

  it("fetches a child cursor directly and preserves the actual update time", async () => {
    const { get, sitemapResponse } = await setup();
    get.mockResolvedValue({
      items: [{ id: 100, updatedAt: "2026-11-13T09:00:00+09:00" }],
      nextCursor: null,
      hasNext: false,
    });
    const xml = await (
      await sitemapResponse("posts", request("/sitemap-posts.xml?cursor=99"))
    ).text();
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith(
      "/dcs/api/posts/sitemap?limit=1000&cursor=99",
    );
    expect(xml).toContain("/community/100</loc>");
    expect(xml).toContain("<lastmod>2026-11-13T09:00:00+09:00</lastmod>");
  });

  it("uses composite item URLs and never invents catalog lastmod", async () => {
    const { get, sitemapResponse } = await setup();
    const identity = {
      name: "의상 & 모자",
      topCategory: "방어 장비",
      subCategory: "모자/가발",
    };
    get.mockResolvedValue({
      items: [identity],
      nextCursor: null,
      hasNext: false,
    });
    const xml = await (
      await sitemapResponse("items", request("/sitemap-items.xml"))
    ).text();
    const key = Buffer.from(
      JSON.stringify([
        identity.topCategory,
        identity.subCategory,
        identity.name,
      ]),
    ).toString("base64url");
    expect(xml).toContain(`/items/${key}</loc>`);
    expect(xml).not.toContain("lastmod");
  });

  it("refreshes successful XML after five minutes and does not serve expired data on error", async () => {
    const { get, sitemapResponse } = await setup();
    const now = jest.spyOn(Date, "now").mockReturnValue(1_000_000);
    get.mockResolvedValue({
      items: [{ id: 1, updatedAt: null }],
      nextCursor: null,
      hasNext: false,
    });
    await sitemapResponse("posts", request("/sitemap-posts.xml"));
    await sitemapResponse("posts", request("/sitemap-posts.xml"));
    expect(get).toHaveBeenCalledTimes(1);
    now.mockReturnValue(1_300_001);
    get.mockRejectedValue(new Error("upstream unavailable"));
    const failed = await sitemapResponse(
      "posts",
      request("/sitemap-posts.xml"),
    );
    expect(failed.status).toBe(503);
    expect(await failed.text()).not.toContain("/community/1");
    get.mockResolvedValue(empty);
    expect(
      await (
        await sitemapResponse("posts", request("/sitemap-posts.xml"))
      ).text(),
    ).not.toContain("/community/1");
  });

  it("rejects bad cursors without contacting providers", async () => {
    const { get, sitemapResponse } = await setup();
    for (const path of [
      "?cursor=-1",
      "?cursor=abc",
      "?cursor=1&cursor=2",
      "?q=foo",
    ]) {
      expect(
        (await sitemapResponse("posts", request(`/sitemap-posts.xml${path}`)))
          .status,
      ).toBe(400);
    }
    expect(
      (
        await sitemapResponse(
          "items",
          request("/sitemap-items.xml?cursor=not-json"),
        )
      ).status,
    ).toBe(400);
    expect(get).not.toHaveBeenCalled();
  });

  it("rejects duplicate records, broken continuations and partial index success", async () => {
    const { get, sitemapResponse } = await setup();
    get.mockResolvedValue({
      items: [{ id: 1 }, { id: 1 }],
      nextCursor: null,
      hasNext: false,
    });
    expect(
      (await sitemapResponse("posts", request("/sitemap-posts.xml"))).status,
    ).toBe(503);
    get.mockResolvedValue({
      items: [{ id: 1 }],
      nextCursor: "2",
      hasNext: true,
    });
    expect(
      (await sitemapResponse("index", request("/sitemap.xml"))).status,
    ).toBe(503);
  });
});
