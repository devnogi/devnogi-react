import { NextRequest } from "next/server";
import { createPublicAuthServerAxios } from "@/lib/api/server";
import { POST as ordinarySignup } from "./route";
import { POST as socialSignup } from "./social/route";

jest.mock("@/lib/api/server", () => ({ createPublicAuthServerAxios: jest.fn() }));

const createClient = jest.mocked(createPublicAuthServerAxios);
afterEach(() => jest.restoreAllMocks());

it.each([
  ["일반", ordinarySignup, "/das/api/auth/signup"],
  ["소셜", socialSignup, "/das/api/auth/signup/social"],
] as const)("%s 가입 BFF는 구형 요청에 대한 Auth 400 코드와 메시지를 전달한다", async (_kind, route, path) => {
  const errorLog = jest.spyOn(console, "error").mockImplementation(() => {});
  const post = jest.fn().mockRejectedValue({ response: {
    status: 400, data: { code: "INVALID_NICKNAME_TICKET", message: "최신 가입 화면으로 갱신해주세요." },
  } });
  createClient.mockReturnValue({ post } as unknown as ReturnType<typeof createPublicAuthServerAxios>);
  const body = new FormData();
  body.set("nickname", "예전수동이름");
  const request = new NextRequest("http://localhost/api/auth/signup", { method: "POST", body });
  const response = await route(request);
  expect(post).toHaveBeenCalledWith(path, expect.any(FormData));
  expect(response.status).toBe(400);
  expect(await response.json()).toMatchObject({
    success: false, code: "INVALID_NICKNAME_TICKET", message: "최신 가입 화면으로 갱신해주세요.",
  });
  expect(errorLog).toHaveBeenCalledTimes(1);
});

it("소셜 가입 BFF는 결합 쿠키만 Auth에 전달한다", async () => {
  const binding = "a".repeat(43);
  const post = jest.fn().mockResolvedValue({ data: { success: true, data: { id: 42 } }, headers: {} });
  createClient.mockReturnValue({ post } as unknown as ReturnType<typeof createPublicAuthServerAxios>);
  const body = new FormData();
  body.set("signupProof", "synthetic-proof");
  const request = new NextRequest("http://localhost/api/auth/signup/social", {
    method: "POST", headers: { cookie: `oauth_flow_binding=${binding}; unrelated=secret` }, body,
  });

  const response = await socialSignup(request);

  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(post).toHaveBeenCalledWith("/das/api/auth/signup/social", expect.any(FormData), {
    headers: { Cookie: `oauth_flow_binding=${binding}` },
  });
});
