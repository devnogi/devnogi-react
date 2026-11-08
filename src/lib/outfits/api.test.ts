import { clientAxios } from "@/lib/api/clients";

import { outfitRequest } from "./api";
jest.mock("@/lib/api/clients", () => ({ clientAxios: { request: jest.fn() } }));
it("uses the shared refresh-aware client and preserves multipart body for retries", async () => {
  const form = new FormData();
  form.append("media", new File(["photo"], "photo.png", { type: "image/png" }));
  jest.mocked(clientAxios.request).mockResolvedValue({
    status: 201,
    data: { success: true, data: { id: 1 } },
  });
  await expect(
    outfitRequest("", { method: "POST", body: form }),
  ).resolves.toEqual({ id: 1 });
  expect(clientAxios.request).toHaveBeenCalledWith(
    expect.objectContaining({
      url: "/outfits",
      method: "POST",
      data: form,
      timeout: 130000,
      withCredentials: true,
    }),
  );
});

it.each([
  [
    413,
    { code: "OUTFIT_PAYLOAD_TOO_LARGE" },
    "사진 용량이 너무 커요. 사진은 최대 5장, 각 5MiB까지 등록할 수 있어요.",
  ],
  [
    504,
    { code: "OUTFIT_UPLOAD_TIMEOUT" },
    "사진 업로드 시간이 초과됐어요. 네트워크를 확인한 뒤 다시 시도해 주세요.",
  ],
  [
    503,
    { code: "OUTFIT_UPSTREAM_UNAVAILABLE" },
    "의장 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.",
  ],
])(
  "maps outfit error %s to an actionable message",
  async (status, data, expectedMessage) => {
    jest.mocked(clientAxios.request).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status, data },
    });

    await expect(outfitRequest("", { method: "POST" })).rejects.toThrow(
      expectedMessage,
    );
  },
);

it.each(["ECONNABORTED", "ETIMEDOUT"])(
  "maps a response-less Axios %s timeout to the upload-timeout message",
  async (code) => {
    jest.mocked(clientAxios.request).mockRejectedValueOnce({
      isAxiosError: true,
      code,
      message: "timeout exceeded",
    });

    await expect(outfitRequest("", { method: "POST" })).rejects.toThrow(
      "사진 업로드 시간이 초과됐어요. 네트워크를 확인한 뒤 다시 시도해 주세요.",
    );
  },
);
