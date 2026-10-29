import robots from "@/app/robots";

describe("robots route", () => {
  it("allows public content and advertises the canonical sitemap", () => {
    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api",
          "/api/",
          "/admin",
          "/admin/",
          "/mypage",
          "/mypage/",
          "/sign-in",
          "/sign-in/",
          "/sign-up",
          "/sign-up/",
          "/social-callback",
          "/social-callback/",
          "/community/write",
          "/community/write/",
        ],
      },
      sitemap: "https://www.memonogi.com/sitemap.xml",
    });
  });
});
