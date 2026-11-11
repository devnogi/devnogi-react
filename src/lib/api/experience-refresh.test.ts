import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

import { installExperienceRefresh } from "./experience-refresh";

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

function setup(success = true) {
  const client = axios.create({
    adapter: async (config) => ({
      data: { success },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    }),
  });
  const cache = new QueryClient();
  const invalidated = jest.spyOn(cache, "invalidateQueries");
  const cleanup = installExperienceRefresh(client, cache);
  return { client, cache, invalidated, cleanup };
}

it("성공한 활동 직후와 비동기 반영 대기 중 총 네 번만 재조회한다", async () => {
  const { client, invalidated, cleanup } = setup();
  await client.post("/posts/like", { postId: 1 });
  expect(invalidated).toHaveBeenCalledTimes(1);
  jest.advanceTimersByTime(5000);
  expect(invalidated).toHaveBeenCalledTimes(4);
  jest.advanceTimersByTime(60000);
  expect(invalidated).toHaveBeenCalledTimes(4);
  cleanup();
});

it("조회·북마크·실패는 재조회 루프를 만들지 않는다", async () => {
  const { client, invalidated, cleanup } = setup();
  await client.get("/outfits/1");
  await client.post("/outfits/1/bookmark");
  await client.get("/user/experience");
  expect(invalidated).not.toHaveBeenCalled();
  cleanup();
  const failed = setup(false);
  await failed.client.delete("/comments/manage/1");
  expect(failed.invalidated).not.toHaveBeenCalled();
  failed.cleanup();
});

it("연속 활동은 대기 타이머를 합치고 provider 해제 시 남은 작업을 취소한다", async () => {
  const { client, invalidated, cleanup } = setup();
  await client.post("/comments/1");
  await client.post("/guilds/2/posts");
  expect(jest.getTimerCount()).toBe(3);
  cleanup();
  jest.runAllTimers();
  expect(invalidated).toHaveBeenCalledTimes(2);
  await client.delete("/outfits/1");
  expect(invalidated).toHaveBeenCalledTimes(2);
});
