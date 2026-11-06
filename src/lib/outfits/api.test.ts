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
      timeout: 30000,
      withCredentials: true,
    }),
  );
});
