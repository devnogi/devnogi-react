import { createPublicAuthServerAxios } from "@/lib/api/server";

import { GET } from "./route";

jest.mock("@/lib/api/server", () => ({
  createPublicAuthServerAxios: jest.fn(),
}));

const createClient = jest.mocked(createPublicAuthServerAxios);

beforeEach(() => {
  jest.clearAllMocks();
});

it("후보 API 응답을 캐시 없이 전달한다", async () => {
  const data = {
    success: true,
    data: {
      nickname: "행복한 나무 A1B2C",
      nicknameTicket: "synthetic-ticket",
      expiresAt: "2099-01-01T00:00:00Z",
    },
  };
  const get = jest.fn().mockResolvedValue({ data });
  createClient.mockReturnValue({ get } as unknown as ReturnType<
    typeof createPublicAuthServerAxios
  >);
  const response = await GET();
  expect(get).toHaveBeenCalledWith("/das/api/auth/random-nickname/candidate");
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(await response.json()).toEqual(data);
});

it("상류 오류 상태를 보존하고 후보를 캐시하지 않는다", async () => {
  const get = jest.fn().mockRejectedValue({
    response: {
      status: 503,
      data: { code: "UNAVAILABLE", message: "잠시 후 다시 시도" },
    },
  });
  createClient.mockReturnValue({ get } as unknown as ReturnType<
    typeof createPublicAuthServerAxios
  >);
  const response = await GET();
  expect(response.status).toBe(503);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect((await response.json()).code).toBe("UNAVAILABLE");
});
