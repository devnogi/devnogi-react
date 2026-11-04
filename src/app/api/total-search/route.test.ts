import { NextRequest } from "next/server";

import { createServerAxios } from "@/lib/api/server";

import { GET } from "./route";

jest.mock("@/lib/api/server", () => ({ createServerAxios: jest.fn() }));

const get = jest.fn();

beforeEach(() => {
  get.mockReset();
  jest.mocked(createServerAxios).mockReturnValue({ get } as never);
});

function request(query = "빛나는") {
  return new NextRequest(
    `http://localhost/api/total-search?${new URLSearchParams({ query })}`,
  );
}

it("두 upstream을 병렬 조회해 공통 형식과 우선순위로 합친다", async () => {
  get
    .mockResolvedValueOnce({
      data: {
        data: [
          { type: "ITEM", keyword: "빛나는 검", targetKey: "빛나는 검" },
          { type: "MENU", keyword: "빛나는 메뉴", targetKey: "HOME" },
        ],
      },
    })
    .mockResolvedValueOnce({
      data: {
        data: [
          {
            type: "USER",
            userId: 7,
            nickname: "빛나는사람",
            serverName: "류트",
          },
        ],
      },
    });

  const response = await GET(request());
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(get).toHaveBeenCalledTimes(2);
  expect(get).toHaveBeenNthCalledWith(
    1,
    "/oab/api/total-search",
    expect.objectContaining({ params: { query: "빛나는", limit: 10 } }),
  );
  expect(get).toHaveBeenNthCalledWith(
    2,
    "/das/api/user/search",
    expect.objectContaining({ params: { query: "빛나는", limit: 10 } }),
  );
  expect(body.partialFailures).toEqual([]);
  expect(body.data.map((item: { type: string }) => item.type)).toEqual([
    "MENU",
    "ITEM",
    "USER",
  ]);
  expect(body.data[2]).toEqual({
    type: "USER",
    label: "빛나는사람",
    targetKey: "7",
    userId: 7,
    serverName: "류트",
  });
});

it("한 upstream 실패 시 성공한 결과와 실패 출처를 반환한다", async () => {
  get
    .mockResolvedValueOnce({
      data: {
        data: [{ type: "ITEM", keyword: "빛나는 검", targetKey: "검" }],
      },
    })
    .mockRejectedValueOnce(new Error("auth unavailable"));

  const response = await GET(request());
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body.data).toHaveLength(1);
  expect(body.partialFailures).toEqual(["AUTH"]);
});

it("두 upstream 실패 시 502를 반환한다", async () => {
  get.mockRejectedValue(new Error("unavailable"));
  const response = await GET(request());
  const body = await response.json();
  expect(response.status).toBe(502);
  expect(body.success).toBe(false);
  expect(body.partialFailures).toEqual(["BATCH", "AUTH"]);
});

it("빈 검색어는 upstream을 호출하지 않는다", async () => {
  const response = await GET(request(" "));
  const body = await response.json();
  expect(response.status).toBe(200);
  expect(body.data).toEqual([]);
  expect(get).not.toHaveBeenCalled();
});
