import { NextRequest } from "next/server";

import { GET } from "./route";

const item = {
  id: 123,
  itemName: "불타래",
  itemDisplayName: "불타래",
  itemCount: 6,
  auctionPricePerUnit: 136,
  dateRegister: "2026-11-14T00:00:00Z",
  dateAuctionExpire: "2026-11-17T00:00:00Z",
  itemSubCategory: "불타래",
  itemTopCategory: "기타",
  itemOptions: [],
};
const data = {
  items: [item],
  meta: {
    currentPage: 1,
    pageSize: 20,
    totalPages: 1,
    totalElements: 1,
    isFirst: true,
    isLast: true,
  },
};
const originalGateway = process.env.GATEWAY_URL;

beforeEach(() => {
  process.env.GATEWAY_URL = "https://gateway.test";
  jest.spyOn(global, "fetch");
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  jest.restoreAllMocks();
  if (originalGateway === undefined) delete process.env.GATEWAY_URL;
  else process.env.GATEWAY_URL = originalGateway;
});

function upstream(payload: unknown, status = 200) {
  jest
    .mocked(fetch)
    .mockResolvedValueOnce(new Response(JSON.stringify(payload), { status }));
}

it("preserves actual wire fields and metadata and disables both cache layers", async () => {
  upstream({ success: true, data });
  const request = new NextRequest(
    "https://app.test/api/auction-realtime/search?itemName=불타래&sortBy=dateAuctionRegister",
  );
  const response = await GET(request);
  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect((await response.json()).data).toEqual(data);
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining("sortBy=dateRegister"),
    { cache: "no-store", signal: request.signal },
  );
});

it("preserves a successful empty result", async () => {
  const empty = {
    items: [],
    meta: { ...data.meta, totalElements: 0, totalPages: 0 },
  };
  upstream({ success: true, data: empty });
  const response = await GET(
    new NextRequest("https://app.test/api/auction-realtime/search"),
  );
  expect(response.status).toBe(200);
  expect((await response.json()).data).toEqual(empty);
});

it.each([
  { success: false, data },
  { success: true, data: null },
  { success: true, data: { ...data, items: [{ ...item, id: undefined }] } },
  { success: true, data: { ...data, items: [{ ...item, id: -1 }] } },
  {
    success: true,
    data: { ...data, items: [{ ...item, id: Number.MAX_SAFE_INTEGER + 1 }] },
  },
  { success: true, data: { ...data, meta: {} } },
])(
  "rejects malformed responses rather than returning an empty success",
  async (payload) => {
    upstream(payload);
    const response = await GET(
      new NextRequest("https://app.test/api/auction-realtime/search"),
    );
    expect(response.status).toBe(500);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toMatchObject({ success: false, data: null });
  },
);

it("does not cache upstream HTTP failures", async () => {
  upstream({}, 503);
  const response = await GET(
    new NextRequest("https://app.test/api/auction-realtime/search"),
  );
  expect(response.status).toBe(500);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
});

it.each([
  null,
  { optionType: 123, optionValue: "x" },
  { optionType: "인챈트", optionValue: {} },
  {
    optionType: "인챈트",
    optionValue: "x",
    optionSubType: "접두",
    optionDesc: 123,
  },
  { optionType: "인챈트", optionValue: "x", optionSubType: {} },
  { optionType: "내구력", optionValue: "1", optionValue2: 10 },
])("rejects unsafe nested option fields: %j", async (option) => {
  upstream({
    success: true,
    data: { ...data, items: [{ ...item, itemOptions: [option] }] },
  });
  const response = await GET(
    new NextRequest("https://app.test/api/auction-realtime/search"),
  );
  expect(response.status).toBe(500);
  expect(await response.json()).toMatchObject({ success: false, data: null });
});

it.each([undefined, null, "설명"])(
  "accepts absent, null, or string optional option fields: %s",
  async (field) => {
    const validData = {
      ...data,
      items: [
        {
          ...item,
          itemOptions: [
            {
              optionType: "인챈트",
              optionValue: "x",
              optionDesc: field,
              optionSubType: field,
              optionValue2: field,
            },
          ],
        },
      ],
    };
    upstream({ success: true, data: validData });
    const response = await GET(
      new NextRequest("https://app.test/api/auction-realtime/search"),
    );
    expect(response.status).toBe(200);
    expect((await response.json()).data).toEqual(validData);
  },
);
