import { NextRequest } from "next/server";

import { createServerAxios } from "@/lib/api/server";

import { GET } from "./route";

jest.mock("@/lib/api/server", () => ({ createServerAxios: jest.fn() }));
const get = jest.fn();
beforeEach(() => {
  get.mockReset();
  jest
    .mocked(createServerAxios)
    .mockReturnValue({ get } as unknown as ReturnType<
      typeof createServerAxios
    >);
});
const payload = {
  success: true,
  data: {
    items: [],
    meta: {
      currentPage: 1,
      pageSize: 20,
      totalPages: 0,
      totalElements: 0,
      isFirst: true,
      isLast: true,
    },
  },
};

it("forwards the selected filters and signal and marks successful empty results no-store", async () => {
  get.mockResolvedValue({ data: payload, status: 200 });
  const request = new NextRequest(
    "http://localhost/api/horn-bugle?serverName=류트&keyword=검&page=1&size=20",
  );
  const response = await GET(request);
  expect(get).toHaveBeenCalledWith(expect.any(String), {
    params: { serverName: "류트", keyword: "검", page: "1", size: "20" },
    signal: request.signal,
  });
  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(await response.json()).toEqual(payload);
});

it.each([
  { success: false, data: payload.data },
  { success: true, data: null },
  { success: true, data: { items: [] } },
])("rejects invalid envelopes without caching: %j", async (data) => {
  get.mockResolvedValue({ data, status: 200 });
  const response = await GET(
    new NextRequest("http://localhost/api/horn-bugle"),
  );
  expect(response.status).toBe(502);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
});

it("preserves upstream failure status with no-store", async () => {
  get.mockRejectedValue({
    isAxiosError: true,
    response: { status: 503, data: { message: "temporarily unavailable" } },
  });
  const response = await GET(
    new NextRequest("http://localhost/api/horn-bugle"),
  );
  expect(response.status).toBe(503);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
});
