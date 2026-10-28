import { NextRequest } from "next/server";

import { createAuthServerAxios } from "@/lib/api/server";
import { createLogger } from "@/lib/logger";

import { PUT } from "./route";

jest.mock("@/lib/api/server", () => ({ createAuthServerAxios: jest.fn() }));
jest.mock("@/lib/logger", () => ({
  createLogger: jest.fn(() => ({ info: jest.fn(), error: jest.fn() })),
}));

it("마이페이지 BFF는 후보 티켓을 전달하되 로그에는 값을 남기지 않는다", async () => {
  const put = jest
    .fn()
    .mockResolvedValue({ status: 200, data: { success: true } });
  jest
    .mocked(createAuthServerAxios)
    .mockReturnValue({ put } as unknown as ReturnType<
      typeof createAuthServerAxios
    >);
  const info = jest.mocked(createLogger).mock.results[0].value
    .info as jest.Mock;
  const form = new FormData();
  form.set("nickname", "행복한 나무 A1B2C");
  form.set("nicknameTicket", "synthetic-private-ticket");
  const request = new NextRequest("http://localhost/api/user/info", {
    method: "PUT",
    body: form,
  });

  const response = await PUT(request);
  expect(response.status).toBe(200);
  expect(put).toHaveBeenCalledWith("/das/api/user/info", expect.any(FormData));
  expect((put.mock.calls[0][1] as FormData).get("nicknameTicket")).toBe(
    "synthetic-private-ticket",
  );
  expect(JSON.stringify(info.mock.calls)).not.toContain(
    "synthetic-private-ticket",
  );
  expect(JSON.stringify(info.mock.calls)).toContain("[REDACTED]");
});
