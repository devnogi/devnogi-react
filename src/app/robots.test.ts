import robots from "@/app/robots";

describe("robots route", () => {
  it("allows public content and advertises the canonical sitemap", () => {
    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/mypage/",
          "/sign-in/",
          "/sign-up/",
          "/social-callback/",
          "/community/write/",
        ],
      },
      sitemap: "https://www.memonogi.com/sitemap.xml",
    });
  });
});
