import { getPublicFeed } from "./public-feed";

const fetchMock = jest.fn();
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  cache: (fn: unknown) => fn,
}));
jest.mock("@/lib/api/gateway-selector", () => ({
  selectServerGatewayUrl: () => "http://localhost:8099",
}));

describe("public feed SSR", () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    global.fetch = fetchMock;
    fetchMock.mockReset();
  });
  afterAll(() => {
    global.fetch = originalFetch;
  });
  it("fetches a bounded anonymous page and strips viewer fields", async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        success: true,
        data: {
          items: [
            {
              id: 2,
              userId: 1,
              content: "공개 글",
              createdAt: "2026-11-13T00:00:00Z",
              liked: true,
              bookmarked: true,
              privateField: "not-for-html",
            },
          ],
          meta: { currentPage: 2, isLast: false },
        },
      }),
    );
    const feed = await getPublicFeed(2);
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "http://localhost:8099/dcs/api/posts/feed?tab=LATEST&page=2&size=20",
    );
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      cache: "no-store",
      credentials: "omit",
      headers: { Accept: "application/json" },
    });
    expect(feed.items[0]).not.toHaveProperty("liked");
    expect(feed.items[0]).not.toHaveProperty("bookmarked");
    expect(feed.items[0]).not.toHaveProperty("privateField");
  });
  it("does not turn failed or malformed responses into empty feeds", async () => {
    fetchMock.mockResolvedValue(new Response("unavailable", { status: 503 }));
    await expect(getPublicFeed(1)).rejects.toThrow();
    fetchMock.mockResolvedValue(Response.json({ success: true, data: {} }));
    await expect(getPublicFeed(1)).rejects.toThrow();
  });
});
