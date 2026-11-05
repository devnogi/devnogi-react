import { NextRequest } from "next/server";

import { selectServerGatewayUrl } from "@/lib/api/gateway-selector";

import { POST } from "./route";

jest.mock("@/lib/api/gateway-selector", () => {
  const actual = jest.requireActual("@/lib/api/gateway-selector");
  return {
    ...actual,
    selectServerGatewayUrl: jest.fn(),
  };
});
jest.mock("@/lib/logger", () => {
  const mockLogger = { info: jest.fn(), error: jest.fn() };
  return {
    createLogger: jest.fn(() => mockLogger),
    mockLogger,
  };
});

const fetchMock = jest.fn();
const mockLogger = jest.requireMock("@/lib/logger").mockLogger as {
  info: jest.Mock;
  error: jest.Mock;
};

function postRequest(headers?: HeadersInit) {
  const form = new FormData();
  form.set(
    "data",
    new Blob([JSON.stringify({ content: "hello", isDraft: false })], {
      type: "application/json",
    }),
  );
  return new NextRequest("http://localhost/api/posts", {
    method: "POST",
    body: form,
    headers,
  });
}

beforeAll(() => {
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    writable: true,
    value: fetchMock,
  });
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(selectServerGatewayUrl).mockReturnValue("https://gateway.test");
});

it("multipart 요청과 access token을 전달하고 201 응답을 보존한다", async () => {
  fetchMock.mockResolvedValue(
    new Response('{"success":true}', {
      status: 201,
      headers: { "content-type": "application/json;charset=UTF-8" },
    }),
  );
  const request = postRequest({
    cookie: "theme=dark; access_token=synthetic-access-token; locale=ko",
  });

  const response = await POST(request);

  expect(response.status).toBe(201);
  expect(response.headers.get("content-type")).toBe(
    "application/json;charset=UTF-8",
  );
  await expect(response.json()).resolves.toEqual({ success: true });
  expect(fetchMock).toHaveBeenCalledWith(
    new URL("/dcs/api/posts", "https://gateway.test"),
    expect.objectContaining({
      method: "POST",
      body: request.body,
      duplex: "half",
      headers: expect.objectContaining({
        cookie: "theme=dark; access_token=synthetic-access-token; locale=ko",
        authorization: "Bearer synthetic-access-token",
        "content-type": expect.stringContaining("multipart/form-data"),
      }),
    }),
  );
  expect(mockLogger.info).toHaveBeenCalledWith(
    expect.stringContaining("POST /posts - 성공 (201)"),
  );
  expect(JSON.stringify(mockLogger.info.mock.calls)).not.toContain(
    "synthetic-access-token",
  );
  expect(JSON.stringify(mockLogger.error.mock.calls)).not.toContain(
    "synthetic-access-token",
  );
});

it.each([401, 403, 500])(
  "%i 응답을 그대로 전달하고 실패로 기록한다",
  async (status) => {
    fetchMock.mockResolvedValue(
      new Response('{"success":false,"code":"UPSTREAM_ERROR"}', {
        status,
        headers: { "content-type": "application/problem+json" },
      }),
    );

    const response = await POST(postRequest());

    expect(response.status).toBe(status);
    expect(response.headers.get("content-type")).toBe(
      "application/problem+json",
    );
    await expect(response.json()).resolves.toEqual({
      success: false,
      code: "UPSTREAM_ERROR",
    });
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining(`POST /posts - 실패 (${status})`),
    );
    expect(mockLogger.info).not.toHaveBeenCalledWith(
      expect.stringContaining(`POST /posts - 성공 (${status})`),
    );
  },
);
