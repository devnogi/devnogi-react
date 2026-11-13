import { publicJson } from "./public-api";

const projection = {
  items: [{ id: 1, updatedAt: null }],
  nextCursor: null,
  hasNext: false,
};
const request = () => new Request("https://www.memonogi.com/sitemap-posts.xml");

function delayedFetch(delay: number) {
  jest.spyOn(globalThis, "fetch").mockImplementation(
    (_url, init) =>
      new Promise((resolve, reject) => {
        const timer = setTimeout(
          () =>
            resolve(
              new Response(JSON.stringify({ success: true, data: projection })),
            ),
          delay,
        );
        init?.signal?.addEventListener(
          "abort",
          () => {
            clearTimeout(timer);
            reject(init.signal?.reason);
          },
          { once: true },
        );
      }),
  );
}

beforeEach(() => {
  jest.resetModules();
  jest.useFakeTimers();
  process.env.GATEWAY_URL = "http://synthetic-gateway.invalid";
  // Native AbortSignal timers are outside Jest's clock; retain real abort events.
  jest.spyOn(AbortSignal, "timeout").mockImplementation((milliseconds) => {
    const controller = new AbortController();
    setTimeout(
      () =>
        controller.abort(new DOMException("Deadline exceeded", "TimeoutError")),
      milliseconds,
    );
    return controller.signal;
  });
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

it("keeps ordinary public requests at five seconds", async () => {
  delayedFetch(8000);
  const result = publicJson("/dcs/api/posts/feed").catch((error) => error);
  await jest.advanceTimersByTimeAsync(5000);
  expect(await result).toMatchObject({ name: "TimeoutError" });
  expect(AbortSignal.timeout).toHaveBeenCalledWith(5000);
});

it("accepts a slow successful sitemap projection and caches complete XML", async () => {
  delayedFetch(8000);
  const { sitemapResponse } = await import("./sitemaps");
  const pending = sitemapResponse("posts", request());
  await jest.advanceTimersByTimeAsync(8000);
  const response = await pending;
  expect(response.status).toBe(200);
  expect(await response.text()).toContain("/community/1</loc>");
  expect(AbortSignal.timeout).toHaveBeenCalledWith(20000);
  expect((await sitemapResponse("posts", request())).status).toBe(200);
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("aborts at twenty seconds without caching an empty result and retries successfully", async () => {
  delayedFetch(25000);
  const { sitemapResponse } = await import("./sitemaps");
  const pending = sitemapResponse("posts", request());
  await jest.advanceTimersByTimeAsync(20000);
  const response = await pending;
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("<urlset");
  jest
    .mocked(fetch)
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, data: projection })),
    );
  const retry = await sitemapResponse("posts", request());
  expect(retry.status).toBe(200);
  expect(await retry.text()).toContain("/community/1</loc>");
  expect((await sitemapResponse("posts", request())).status).toBe(200);
  expect(fetch).toHaveBeenCalledTimes(2);
});
