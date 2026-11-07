import { NextRequest } from "next/server";

import { proxyGuild } from "./proxy";

jest.mock("@/lib/api/gateway-selector", () => ({
  selectServerGatewayUrl: () => "https://gateway.test",
}));

it("checks identity upstream even on member photos and never shares the response cache", async () => {
  const mockFetch = jest
    .fn()
    .mockResolvedValue(
      new Response("bytes", { headers: { "content-type": "image/png" } }),
    );
  global.fetch = mockFetch;
  const request = new NextRequest(
    "http://localhost/api/guilds/2/posts/3/photo",
    { headers: { cookie: "access_token=member", "x-auth-roles": "admin" } },
  );
  const result = await proxyGuild(request, ["2", "posts", "3", "photo"]);
  const [url, init] = mockFetch.mock.calls[0];
  expect(String(url)).toBe(
    "https://gateway.test/dcs/api/guilds/2/posts/3/photo",
  );
  expect(init.headers.get("authorization")).toBe("Bearer member");
  expect(init.headers.has("x-auth-roles")).toBe(false);
  expect(result.headers.get("cache-control")).toContain("no-store");
  expect(await result.text()).toBe("bytes");
});

it("preserves the admin route and rejects non-segments", async () => {
  const mockFetch = jest
    .fn()
    .mockResolvedValue(new Response(null, { status: 204 }));
  global.fetch = mockFetch;
  const request = new NextRequest(
    "http://localhost/api/admin/guilds/1/master",
    { method: "PUT", headers: { "x-guild-action": "1" }, body: "{}" },
  );
  expect((await proxyGuild(request, ["1", "master"], true)).status).toBe(204);
  expect(String(mockFetch.mock.calls[0][0])).toBe(
    "https://gateway.test/dcs/api/admin/guilds/1/master",
  );
  expect((await proxyGuild(request, [".."], true)).status).toBe(400);
  expect(mockFetch).toHaveBeenCalledTimes(1);
});

it("rejects ambient-cookie form posts before forwarding authentication", async () => {
  global.fetch = jest.fn();
  const request = new NextRequest(
    "https://memonogi.test/api/guilds/1/recruitments/2/close",
    {
      method: "POST",
      headers: { cookie: "access_token=member", origin: "https://other.test" },
    },
  );
  expect(
    (await proxyGuild(request, ["1", "recruitments", "2", "close"])).status,
  ).toBe(403);
  expect(global.fetch).not.toHaveBeenCalled();
});
