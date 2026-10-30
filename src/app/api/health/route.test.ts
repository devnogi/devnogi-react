import { GET } from "./route";

describe("health endpoint", () => {
  const originalRevision = process.env.APP_REVISION;

  afterEach(() => {
    if (originalRevision === undefined) {
      delete process.env.APP_REVISION;
    } else {
      process.env.APP_REVISION = originalRevision;
    }
  });

  it("returns the runtime revision and preserves the health response contract", async () => {
    process.env.APP_REVISION = "0123456789abcdef0123456789abcdef01234567";

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe(
      "no-cache, no-store, must-revalidate",
    );
    expect(body).toEqual({
      status: "ok",
      timestamp: expect.any(String),
      service: "devnogi-react",
      revision: "0123456789abcdef0123456789abcdef01234567",
      environment: expect.any(String),
      uptime: expect.any(Number),
      memory: {
        rss: expect.stringMatching(/^\d+MB$/),
        heapTotal: expect.stringMatching(/^\d+MB$/),
        heapUsed: expect.stringMatching(/^\d+MB$/),
      },
    });
  });

  it("identifies a local runtime without a build revision", async () => {
    delete process.env.APP_REVISION;

    expect((await (await GET()).json()).revision).toBe("development");
  });
});
