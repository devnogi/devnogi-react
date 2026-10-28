import { NextRequest } from "next/server";

import { createAuthServerAxios } from "@/lib/api/server";

import { POST as login } from "./login/route";
import { POST as logout } from "./logout/route";
import { GET as me } from "./me/route";
import { POST as refresh } from "./refresh/route";

jest.mock("@/lib/api/server", () => ({ createAuthServerAxios: jest.fn() }));
const post = jest.fn();
const get = jest.fn();
const createClient = jest.mocked(createAuthServerAxios);
// auth/contracts/openapi.yaml의 LoginUser와 UserInfo를 소비하는 fixture.
const user = {
  userId: 7,
  email: "local@example.test",
  nickname: "local",
  profileImageUrl: null,
  role: "USER",
};
const userInfo = {
  ...user,
  serverName: null,
  verified: false,
  createdAt: "2026-10-21T00:00:00",
  lastLoginAt: null,
};
const envelope = (data: unknown) => ({
  success: true,
  code: "COMMON_SUCCESS",
  message: "성공",
  data,
  timestamp: "2026-10-21T00:00:00Z",
});
const fail = (status: number) => ({
  isAxiosError: true,
  response: {
    status,
    data: {
      success: false,
      code: "INVALID_TOKEN",
      message: "유효하지 않는 토큰입니다.",
      data: null,
    },
  },
});
const request = (path: string, body?: string) =>
  new NextRequest(`http://localhost/api/auth/${path}`, {
    method: path === "me" ? "GET" : "POST",
    headers: {
      cookie: "access_token=expired-access; refresh_token=synthetic-refresh",
      authorization: "Bearer expired-access",
    },
    ...(body === undefined ? {} : { body }),
  });
const validLogin = () =>
  request(
    "login",
    JSON.stringify({ email: user.email, password: "synthetic-password" }),
  );
const routes = [
  ["login", login, validLogin],
  ["me", me, () => request("me")],
  ["refresh", refresh, () => request("refresh")],
  ["logout", logout, () => request("logout")],
] as const;

describe("인증 BFF 계약", () => {
  const env = process.env;
  beforeEach(() => {
    jest.clearAllMocks();
    post.mockReset();
    get.mockReset();
    createClient.mockReturnValue({ post, get } as unknown as ReturnType<
      typeof createAuthServerAxios
    >);
    process.env = {
      ...env,
      JWT_COOKIE_DOMAIN: "",
      JWT_COOKIE_SECURE: "false",
      JWT_COOKIE_SAME_SITE: "Lax",
    };
  });
  afterEach(() => {
    process.env = env;
  });

  it("로그인은 기존 인증 없이 email/password만 전달하고 사용자와 Set-Cookie를 보존한다", async () => {
    const cookies = [
      "access_token=synthetic-access; Path=/; HttpOnly; SameSite=Lax",
      "refresh_token=synthetic-refresh; Path=/; HttpOnly; SameSite=Lax",
    ];
    post.mockResolvedValue({
      status: 200,
      data: envelope(user),
      headers: { "set-cookie": cookies },
    });
    const req = validLogin();
    const result = await login(req);
    expect(createClient).toHaveBeenCalledWith(req, "none");
    expect(post).toHaveBeenCalledWith("/das/api/auth/login", {
      email: user.email,
      password: "synthetic-password",
    });
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual(envelope(user));
    expect(result.headers.getSetCookie()).toEqual(cookies);
  });

  it("잘못된 JSON은 upstream 호출 없이 400이다", async () => {
    expect((await login(request("login", "{"))).status).toBe(400);
    expect((await login(request("login", "null"))).status).toBe(400);
    expect(createClient).not.toHaveBeenCalled();
  });

  it("me는 기존 사용자 DTO를 보존한다", async () => {
    get.mockResolvedValue({
      status: 200,
      data: envelope(userInfo),
      headers: {},
    });
    const result = await me(request("me"));
    expect(get).toHaveBeenCalledWith("/das/api/user/info");
    expect(await result.json()).toEqual(envelope(userInfo));
  });

  describe.each(routes)("%s", (_name, route, makeRequest) => {
    it.each([400, 401, 403, 500, 503])(
      "upstream %i를 성공으로 바꾸지 않는다",
      async (status) => {
        post.mockRejectedValue(fail(status));
        get.mockRejectedValue(fail(status));
        const result = await route(makeRequest());
        expect(result.status).toBe(status);
        expect(await result.json()).toEqual(fail(status).response.data);
      },
    );
    it("200 HTML과 잘못된 JSON을 성공으로 취급하지 않는다", async () => {
      for (const data of [
        "<html>OAuth login</html>",
        { success: true, data: "not-a-user" },
      ]) {
        if (_name === "logout") {
          // null data는 정상 계약이므로 envelope 자체가 없는 JSON으로 검사한다.
          post.mockResolvedValue({
            status: 200,
            data: typeof data === "string" ? data : {},
            headers: {},
          });
        } else {
          post.mockResolvedValue({ status: 200, data, headers: {} });
        }
        get.mockResolvedValue({ status: 200, data, headers: {} });
        expect((await route(makeRequest())).status).toBe(502);
      }
    });
    it("upstream redirect와 연결 실패를 502로 처리한다", async () => {
      post.mockRejectedValue(fail(302));
      get.mockRejectedValue(fail(302));
      expect((await route(makeRequest())).status).toBe(502);
      post.mockRejectedValue(new Error("connect failed"));
      get.mockRejectedValue(new Error("connect failed"));
      expect((await route(makeRequest())).status).toBe(502);
    });
  });

  it("refresh는 refresh 전용 client를 사용하고 갱신 쿠키를 모두 전달한다", async () => {
    const cookies = [
      "access_token=new-access; HttpOnly; Path=/",
      "refresh_token=new-refresh; HttpOnly; Path=/",
    ];
    post.mockResolvedValue({
      status: 200,
      data: envelope(user),
      headers: { "set-cookie": cookies },
    });
    const req = request("refresh");
    const result = await refresh(req);
    expect(createClient).toHaveBeenCalledWith(req, "refresh");
    expect(post).toHaveBeenCalledWith("/das/api/auth/refresh");
    expect(await result.json()).toEqual(envelope(user));
    expect(result.headers.getSetCookie()).toEqual(cookies);
  });

  it("정상 logout은 access 인증 client로 서버 폐기를 요청하고 삭제 쿠키를 그대로 전달한다", async () => {
    const cookies = [
      "access_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax",
      "refresh_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax",
    ];
    post.mockResolvedValue({
      status: 200,
      data: envelope(null),
      headers: { "set-cookie": cookies },
    });
    const req = new NextRequest("http://localhost/api/auth/logout", {
      method: "POST",
      headers: {
        cookie:
          "access_token=synthetic-valid-access; refresh_token=synthetic-refresh",
      },
    });
    const result = await logout(req);
    expect(createClient).toHaveBeenCalledWith(req);
    expect(post).toHaveBeenCalledWith("/das/api/auth/logout");
    expect(result.status).toBe(200);
    expect(result.headers.getSetCookie()).toEqual(cookies);
  });

  it.each([
    ["쿠키 없음", {}],
    [
      "빈 access 쿠키",
      { cookie: "access_token=; refresh_token=synthetic-refresh" },
    ],
    ["refresh 쿠키만 있음", { cookie: "refresh_token=synthetic-refresh" }],
    ["Bearer만 있음", { authorization: "Bearer synthetic-access" }],
  ] as const)(
    "logout에 %s이면 upstream 호출 없이 401과 같은 scope의 삭제 쿠키를 반환한다",
    async (_name, headers) => {
      post.mockResolvedValue({
        status: 200,
        data: envelope(null),
        headers: {},
      });
      const result = await logout(
        new NextRequest("http://localhost/api/auth/logout", {
          method: "POST",
          headers,
        }),
      );
      expect(result.status).toBe(401);
      expect(await result.json()).toEqual({
        success: false,
        message: "서버 로그아웃을 확인할 수 없습니다. 인증 쿠키가 필요합니다.",
      });
      expect(createClient).not.toHaveBeenCalled();
      expect(post).not.toHaveBeenCalled();
      const cookies = result.headers.getSetCookie();
      expect(cookies).toHaveLength(2);
      expect(cookies.some((cookie) => cookie.startsWith("access_token="))).toBe(
        true,
      );
      expect(
        cookies.some((cookie) => cookie.startsWith("refresh_token=")),
      ).toBe(true);
      for (const cookie of cookies) {
        expect(cookie).toMatch(/Max-Age=0/i);
        expect(cookie).toMatch(/Path=\//i);
        expect(cookie).toMatch(/HttpOnly/i);
        expect(cookie).toMatch(/SameSite=lax/i);
        expect(cookie).not.toMatch(/Domain=|Secure/i);
      }
    },
  );

  it("실패 logout은 host-only 쿠키를 지우되 서버 폐기 성공을 선언하지 않는다", async () => {
    post.mockRejectedValue(fail(503));
    const result = await logout(request("logout"));
    expect(result.status).toBe(503);
    expect((await result.json()).success).toBe(false);
    const cookies = result.headers.getSetCookie();
    expect(cookies).toHaveLength(2);
    for (const cookie of cookies) {
      expect(cookie).toMatch(/Max-Age=0/i);
      expect(cookie).toMatch(/Path=\//i);
      expect(cookie).toMatch(/HttpOnly/i);
      expect(cookie).toMatch(/SameSite=lax/i);
      expect(cookie).not.toMatch(/Domain=|Secure/i);
    }
  });

  it("설정 생략 시 기존 운영 쿠키 삭제 scope를 유지한다", async () => {
    delete process.env.JWT_COOKIE_DOMAIN;
    delete process.env.JWT_COOKIE_SECURE;
    delete process.env.JWT_COOKIE_SAME_SITE;
    post.mockRejectedValue(fail(503));
    const result = await logout(request("logout"));
    for (const cookie of result.headers.getSetCookie()) {
      expect(cookie).toMatch(/Domain=\.memonogi.com/i);
      expect(cookie).toMatch(/Secure/i);
      expect(cookie).toMatch(/SameSite=none/i);
    }
  });
});
