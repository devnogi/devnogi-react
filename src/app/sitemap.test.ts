import sitemap from "@/app/sitemap";

describe("sitemap route", () => {
  it("contains only public canonical URLs", () => {
    const entries = sitemap();

    expect(entries).toContainEqual({ url: "https://www.memonogi.com/" });
    expect(entries).toContainEqual({
      url: "https://www.memonogi.com/auction-history",
    });
    expect(entries).toHaveLength(8);
    expect(
      entries.every((entry) =>
        entry.url.startsWith("https://www.memonogi.com/"),
      ),
    ).toBe(true);
  });
});
