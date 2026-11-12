import { NextRequest } from "next/server";

import { proxyHero } from "./proxy";

jest.mock("@/lib/api/gateway-selector", () => ({
  selectServerGatewayUrl: () => "https://gateway.test",
}));
beforeEach(() => {
  global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve(
      new Response('{"success":true,"data":null}', {
        headers: { "content-type": "application/json" },
      }),
    ),
  );
});

it("forwards only Auth access cookie and multipart boundary, never spoofed identity", async () => {
  const request = new NextRequest(
    "https://www.memonogi.com/api/user/hero/creatives",
    {
      method: "POST",
      headers: {
        origin: "https://www.memonogi.com",
        "x-hero-action": "1",
        cookie: "access_token=member; refresh_token=private",
        "content-type": "multipart/form-data; boundary=test",
        "x-auth-roles": "ADMIN",
      },
      body: "--test",
    },
  );
  const response = await proxyHero(request, ["creatives"], "user");
  const [target, init] = jest.mocked(fetch).mock.calls[0];
  expect(String(target)).toBe(
    "https://gateway.test/das/api/user/hero/creatives",
  );
  const headers = init?.headers as Headers;
  expect(headers.get("cookie")).toBe("access_token=member");
  expect(headers.get("content-type")).toContain("boundary=test");
  expect(headers.has("x-auth-roles")).toBe(false);
  expect(response.headers.get("cache-control")).toContain("no-store");
});

it.each([
  {},
  { origin: "https://evil.com", "x-hero-action": "1" },
  { origin: "https://www.memonogi.com" },
  {
    origin: "https://www.memonogi.com",
    "x-hero-action": "1",
    "sec-fetch-site": "same-site",
  },
])("rejects cross-origin and ambient-cookie mutations %#", async (headers) => {
  const request = new NextRequest(
    "https://www.memonogi.com/api/admin/hero/slides",
    { method: "POST", headers: headers as HeadersInit },
  );
  expect((await proxyHero(request, ["slides"], "admin")).status).toBe(403);
  expect(fetch).not.toHaveBeenCalled();
});

it("public reads do not forward cookies, and invalid paths never reach upstream", async () => {
  const request = new NextRequest("https://www.memonogi.com/api/hero", {
    headers: { cookie: "access_token=private" },
  });
  expect((await proxyHero(request, [], "public")).status).toBe(200);
  expect(
    (jest.mocked(fetch).mock.calls[0][1]?.headers as Headers).has("cookie"),
  ).toBe(false);
  expect((await proxyHero(request, [".."], "public")).status).toBe(400);
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("rejects login HTML and preserves upstream conflict status", async () => {
  jest
    .mocked(fetch)
    .mockResolvedValueOnce(
      new Response("<html/>", { headers: { "content-type": "text/html" } }),
    );
  const request = new NextRequest("https://www.memonogi.com/api/hero");
  expect((await proxyHero(request, [], "public")).status).toBe(502);
  jest.mocked(fetch).mockResolvedValueOnce(
    new Response('{"success":false}', {
      status: 409,
      headers: { "content-type": "application/json" },
    }),
  );
  expect((await proxyHero(request, [], "public")).status).toBe(409);
});
