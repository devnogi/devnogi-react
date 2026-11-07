import axios, { type AxiosAdapter, AxiosError } from "axios";

import { clientAxios } from "@/lib/api/clients";
import { MEDIA_UPLOAD_TIMEOUT_MS } from "@/lib/api/timeouts";

import { guildRequest } from "./request";

const original = clientAxios.defaults.adapter;
afterEach(() => {
  clientAxios.defaults.adapter = original;
  jest.restoreAllMocks();
});
const unauthorized: AxiosAdapter = async (config) => {
  throw new AxiosError("expired", "401", config, undefined, {
    status: 401,
    statusText: "Unauthorized",
    data: { message: "expired" },
    headers: {},
    config,
  });
};
it("관리자 쓰기 요청의 만료된 인증을 갱신하고 동일한 본문과 헤더로 재시도한다", async () => {
  const refresh = jest.spyOn(axios, "post").mockResolvedValue({});
  const logger = jest.spyOn(console, "log").mockImplementation(() => {});
  let calls = 0;
  clientAxios.defaults.adapter = async (config) => {
    calls++;
    expect(config.headers.get("X-Guild-Action")).toBe("1");
    expect(config.data).toContain("private reason");
    if (calls === 1) return unauthorized(config);
    return {
      config,
      status: 200,
      statusText: "OK",
      headers: {},
      data: { success: true, data: { id: 7 } },
    };
  };
  await expect(
    guildRequest("admin/guilds/registrations/7/review", "POST", {
      reason: "private reason",
    }),
  ).resolves.toEqual({ id: 7 });
  expect(calls).toBe(2);
  expect(refresh).toHaveBeenCalledTimes(1);
  expect(logger).not.toHaveBeenCalled();
});
it("방문자 공개 조회 오류는 로그인 전환 없이 반환한다", async () => {
  const refresh = jest.spyOn(axios, "post");
  clientAxios.defaults.adapter = unauthorized;
  await expect(
    guildRequest("guilds/1", "GET", undefined, true),
  ).rejects.toThrow("expired");
  expect(refresh).not.toHaveBeenCalled();
});
it("사진 첨부와 본문 없는 쓰기 요청에도 보호 헤더를 보낸다", async () => {
  const file = new FormData();
  file.append("file", "synthetic");
  clientAxios.defaults.adapter = async (config) => {
    expect(config.headers.get("X-Guild-Action")).toBe("1");
    if (config.method === "put")
      expect(config.timeout).toBe(MEDIA_UPLOAD_TIMEOUT_MS);
    return { config, status: 204, statusText: "", data: "", headers: {} };
  };
  await expect(
    guildRequest("guilds/1/media/banner", "PUT", file),
  ).resolves.toBeUndefined();
  await expect(
    guildRequest("guilds/1/members/me", "DELETE"),
  ).resolves.toBeUndefined();
});
it("실패 응답의 메시지를 호출자에게 전달한다", async () => {
  clientAxios.defaults.adapter = async (config) => ({
    config,
    status: 200,
    statusText: "OK",
    headers: {},
    data: { success: false, message: "모집 마감" },
  });
  await expect(
    guildRequest("guilds/1/recruitments/2/applications", "POST", {}),
  ).rejects.toThrow("모집 마감");
});
