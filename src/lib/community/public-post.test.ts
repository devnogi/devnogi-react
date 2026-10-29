import { getPublicPost, isPublicPost, type PostDetail } from "./public-post";

const originalGatewayUrl = process.env.GATEWAY_URL;
const originalFetch = global.fetch;
const mockFetch = jest.fn();

const post: PostDetail = {
  id: 1,
  boardId: 2,
  userId: 3,
  username: "테스터",
  title: "공개 게시글",
  content: "본문",
  viewCount: 0,
  likeCount: 0,
  commentCount: 0,
  isDraft: false,
  isBlocked: false,
  isLiked: false,
  createdAt: "2026-10-29T00:00:00.000Z",
  updatedAt: "2026-10-29T00:00:00.000Z",
};

function apiResponse({
  status = 200,
  payload,
}: {
  status?: number;
  payload?: unknown;
}) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => payload,
  } as Response;
}

describe("isPublicPost", () => {
  it("accepts a post that is neither draft nor blocked", () => {
    expect(isPublicPost(post)).toBe(true);
  });

  it.each([
    { ...post, isDraft: true },
    { ...post, isBlocked: true },
  ])("rejects drafts and blocked posts", (nonPublicPost) => {
    expect(isPublicPost(nonPublicPost)).toBe(false);
  });
});

describe("getPublicPost", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch as typeof fetch;
    process.env.GATEWAY_URL = "https://gateway.example.test";
  });

  afterAll(() => {
    global.fetch = originalFetch;
    if (originalGatewayUrl === undefined) {
      delete process.env.GATEWAY_URL;
    } else {
      process.env.GATEWAY_URL = originalGatewayUrl;
    }
  });

  it("returns not-found without a request for an invalid ID", async () => {
    await expect(getPublicPost(0)).resolves.toEqual({ status: "not-found" });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("fails closed when the public gateway is not configured", async () => {
    delete process.env.GATEWAY_URL;

    await expect(getPublicPost(2)).resolves.toEqual({ status: "unavailable" });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("maps a deleted post to not-found", async () => {
    mockFetch.mockResolvedValue(apiResponse({ status: 404 }));

    await expect(getPublicPost(3)).resolves.toEqual({ status: "not-found" });
  });

  it.each([401, 403, 500])(
    "fails closed for an unavailable gateway response (%i)",
    async (status) => {
      mockFetch.mockResolvedValue(apiResponse({ status }));

      await expect(getPublicPost(10 + status)).resolves.toEqual({
        status: "unavailable",
      });
    },
  );

  it("fails closed for a malformed gateway payload", async () => {
    mockFetch.mockResolvedValue(
      apiResponse({ status: 200, payload: { success: true, data: {} } }),
    );

    await expect(getPublicPost(20)).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("does not expose a draft or blocked post", async () => {
    mockFetch.mockResolvedValue(
      apiResponse({
        status: 200,
        payload: { success: true, data: { ...post, isBlocked: true } },
      }),
    );

    await expect(getPublicPost(21)).resolves.toEqual({
      status: "not-public",
    });
  });

  it("fails closed when the request rejects, including a timeout", async () => {
    mockFetch.mockRejectedValue(new DOMException("Timed out", "TimeoutError"));

    await expect(getPublicPost(22)).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("returns only an available public post and uses a bounded request", async () => {
    mockFetch.mockResolvedValue(
      apiResponse({ status: 200, payload: { success: true, data: post } }),
    );

    await expect(getPublicPost(23)).resolves.toEqual({
      status: "available",
      post,
    });
    expect(mockFetch).toHaveBeenCalledWith(
      new URL("/dcs/api/posts/details/23", process.env.GATEWAY_URL),
      expect.objectContaining({ cache: "no-store", signal: expect.anything() }),
    );
  });
});
