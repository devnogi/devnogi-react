import { NextRequest } from "next/server";

import { createAuthServerAxios } from "@/lib/api/server";
import { experienceSummaryFixture } from "@/mocks/data/experience";

import { GET as history } from "./history/route";
import { GET as summary } from "./route";

jest.mock("@/lib/api/server", () => ({ createAuthServerAxios: jest.fn() }));
const get = jest.fn();
const createClient = jest.mocked(createAuthServerAxios);
beforeEach(() => {
  jest.clearAllMocks();
  get.mockReset();
  createClient.mockReturnValue({ get } as unknown as ReturnType<
    typeof createAuthServerAxios
  >);
});

it("본인 인증을 전달하고 임의 userId 파라미터는 upstream에 보내지 않는다", async () => {
  const request = new NextRequest(
    "http://localhost/api/user/experience?userId=99",
    { headers: { cookie: "access_token=synthetic" } },
  );
  const payload = { success: true, data: experienceSummaryFixture };
  get.mockResolvedValue({ status: 200, data: payload, headers: {} });
  const response = await summary(request);
  expect(createClient).toHaveBeenCalledWith(request);
  expect(get).toHaveBeenCalledWith("/das/api/user/experience");
  expect(await response.json()).toEqual(payload);
  expect(response.headers.get("Cache-Control")).toBe("private, no-store");
});

it("이력의 커서와 크기만 전달한다", async () => {
  get.mockResolvedValue({
    status: 200,
    data: { success: true, data: { items: [], nextCursor: null } },
    headers: {},
  });
  const response = await history(
    new NextRequest(
      "http://localhost/api/user/experience/history?cursor=12&size=40&userId=99",
    ),
  );
  expect(get).toHaveBeenCalledWith("/das/api/user/experience/history", {
    params: { cursor: "12", size: "40" },
  });
  expect(response.status).toBe(200);
});

it.each(["cursor=-1", "cursor=abc", "size=101", "size=0", "size=1.5"])(
  "잘못된 이력 범위를 거절한다: %s",
  async (query) => {
    expect(
      (
        await history(
          new NextRequest(
            `http://localhost/api/user/experience/history?${query}`,
          ),
        )
      ).status,
    ).toBe(400);
    expect(get).not.toHaveBeenCalled();
  },
);

it.each([summary, history])(
  "미인증 오류와 HTML 응답을 성공으로 바꾸지 않는다",
  async (handler) => {
    const request = new NextRequest("http://localhost/api/user/experience");
    get.mockRejectedValue({
      isAxiosError: true,
      response: { status: 401, data: { success: false, message: "인증 필요" } },
    });
    expect((await handler(request)).status).toBe(401);
    get.mockResolvedValue({
      status: 200,
      data: "<html>login</html>",
      headers: {},
    });
    expect((await handler(request)).status).toBe(502);
  },
);
