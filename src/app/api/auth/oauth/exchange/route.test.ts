import { NextRequest } from "next/server";
import { createPublicAuthServerAxios } from "@/lib/api/server";
import { POST } from "./route";

jest.mock("@/lib/api/server", () => ({ createPublicAuthServerAxios: jest.fn() }));

const post = jest.fn();
const binding = "a".repeat(43);
const request = (body: string, cookie = binding) => new NextRequest("http://localhost/api/auth/oauth/exchange", {
  method: "POST",
  headers: cookie ? { cookie: `oauth_flow_binding=${cookie}; unrelated=secret` } : {},
  body,
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(createPublicAuthServerAxios).mockReturnValue({ post } as unknown as ReturnType<typeof createPublicAuthServerAxios>);
});

it("불투명 code와 결합 쿠키만 Auth에 전달하고 가입 응답은 캐시하지 않는다", async () => {
  post.mockResolvedValue({ status: 200, data: {
    success: true, data: { type: "SIGNUP_REQUIRED", provider: "GOOGLE", email: "user@example.test", signupProof: "synthetic-proof" },
  }, headers: { "set-cookie": ["oauth_flow_binding=renewed; Path=/; HttpOnly"] } });

  const response = await POST(request(JSON.stringify({ code: "synthetic-code" })));

  expect(post).toHaveBeenCalledWith("/das/api/auth/oauth/exchange", { code: "synthetic-code" }, {
    headers: { Cookie: `oauth_flow_binding=${binding}` },
  });
  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(response.headers.getSetCookie()).toEqual(["oauth_flow_binding=renewed; Path=/; HttpOnly"]);
  expect((await response.json()).data.signupProof).toBe("synthetic-proof");
});

it("결합 쿠키가 없거나 요청이 잘못되면 Auth를 호출하지 않는다", async () => {
  expect((await POST(request(JSON.stringify({ code: "synthetic-code" }), ""))).status).toBe(400);
  expect((await POST(request(JSON.stringify({ code: "synthetic-code" }), "invalid"))).status).toBe(400);
  expect((await POST(request("{"))).status).toBe(400);
  expect(post).not.toHaveBeenCalled();
});

it("Auth의 오류·HTML·응답 손상은 가입 정보나 코드 없이 실패한다", async () => {
  post.mockRejectedValueOnce({ response: { status: 400, data: { message: "private@example.test" } } });
  const invalid = await POST(request(JSON.stringify({ code: "synthetic-code" })));
  expect(invalid.status).toBe(400);
  expect(JSON.stringify(await invalid.json())).not.toContain("private@example.test");

  post.mockResolvedValueOnce({ status: 200, data: "<html>redirect</html>", headers: {} });
  const malformed = await POST(request(JSON.stringify({ code: "synthetic-code" })));
  expect(malformed.status).toBe(502);
});
