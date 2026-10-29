import { NextRequest } from "next/server";

import { config, middleware } from "@/middleware";

describe("SEO host normalization middleware", () => {
  it("permanently redirects only the legacy production host and preserves path and query", () => {
    const response = middleware(
      new NextRequest(
        "http://memonogi.com/auction-history?item_name=%ED%85%8C%EC%8A%A4%ED%8A%B8",
      ),
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://www.memonogi.com/auction-history?item_name=%ED%85%8C%EC%8A%A4%ED%8A%B8",
    );
  });

  it("does not redirect canonical, local, or preview hosts", () => {
    for (const url of [
      "https://www.memonogi.com/auction-history",
      "http://localhost:3000/auction-history",
      "https://preview.memonogi.com/auction-history",
    ]) {
      expect(
        middleware(new NextRequest(url)).headers.get("location"),
      ).toBeNull();
    }
  });

  it("does not retain a development port in the canonical redirect URL", () => {
    const request = new NextRequest(
      "http://memonogi.com:3011/auction-history?item_name=%EA%B2%80",
      { headers: { host: "memonogi.com" } },
    );

    expect(middleware(request).headers.get("location")).toBe(
      "https://www.memonogi.com/auction-history?item_name=%EA%B2%80",
    );
  });

  it("does not run for API or Next static assets, but normalizes metadata routes", () => {
    expect(config.matcher).toEqual([
      "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ]);
  });
});
