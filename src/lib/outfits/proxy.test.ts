import { NextRequest } from "next/server";

import { selectServerGatewayUrl } from "@/lib/api/gateway-selector";

import { proxyOutfit } from "./proxy";
jest.mock("@/lib/api/gateway-selector", () => ({
  selectServerGatewayUrl: jest.fn(() => "https://gateway.test"),
}));
const mockFetch = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = mockFetch;
});
it("streams multipart, keeps authorization and repeated filters, but never trusts internal identity headers", async () => {
  mockFetch.mockResolvedValue(
    new Response('{"success":true,"data":{"id":1}}', { status: 201 }),
  );
  const body = new FormData();
  body.append("media", new File(["photo"], "test.png", { type: "image/png" }));
  const request = new NextRequest(
    "http://localhost/api/outfits?tags=a&tags=b",
    {
      method: "POST",
      body,
      headers: { cookie: "access_token=synthetic", "x-auth-user-id": "999" },
    },
  );
  const response = await proxyOutfit(request);
  expect(response.status).toBe(201);
  expect(response.headers.get("cache-control")).toBe("no-store");
  const [url, init] = mockFetch.mock.calls[0];
  expect(String(url)).toBe(
    "https://gateway.test/dcs/api/outfits?tags=a&tags=b",
  );
  expect(init.body).toBe(request.body);
  expect(init.headers.get("authorization")).toBe("Bearer synthetic");
  expect(init.headers.has("x-auth-user-id")).toBe(false);
});
it("streams public image bytes for the optimizer without leaking authentication", async () => {
  mockFetch.mockResolvedValueOnce(
    new Response(null, {
      status: 302,
      headers: { location: "https://storage.test/image" },
    }),
  );
  mockFetch.mockResolvedValueOnce(
    new Response("photo-bytes", { headers: { "content-type": "image/png" } }),
  );
  const response = await proxyOutfit(
    new NextRequest("http://localhost/api/outfits/1/images/2", {
      headers: { cookie: "access_token=private" },
    }),
    ["1", "images", "2"],
  );
  expect(response.status).toBe(200);
  expect(await response.text()).toBe("photo-bytes");
  expect(mockFetch.mock.calls[0][1].headers.has("authorization")).toBe(false);
  expect(mockFetch.mock.calls[1][1].headers).toBeUndefined();
  expect(response.headers.get("content-type")).toBe("image/png");
  mockFetch.mockResolvedValueOnce(new Response(null, { status: 204 }));
  expect(
    (
      await proxyOutfit(
        new NextRequest("http://localhost/api/outfits/1", { method: "DELETE" }),
        ["1"],
      )
    ).status,
  ).toBe(204);
});
it("rejects path traversal and returns a bounded service error", async () => {
  expect(
    (await proxyOutfit(new NextRequest("http://localhost/api/outfits"), [".."]))
      .status,
  ).toBe(400);
  expect(mockFetch).not.toHaveBeenCalled();
  jest.mocked(selectServerGatewayUrl).mockImplementationOnce(() => {
    throw new Error("private configuration");
  });
  const response = await proxyOutfit(
    new NextRequest("http://localhost/api/outfits"),
  );
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("private configuration");
});
