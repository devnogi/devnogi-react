import axios from "axios";
import { NextRequest } from "next/server";

import { createAuthServerAxios, createServerAxios } from "./server";

jest.mock("@/mocks/initServer", () => ({ initMockServer: jest.fn() }));
jest.mock("./gateway-selector", () => ({
  selectServerGatewayUrl: () => "http://localhost:8090",
}));

const request = (cookie?: string, authorization?: string) =>
  new NextRequest("http://localhost/api/auth/refresh", {
    headers: {
      ...(cookie ? { cookie } : {}),
      ...(authorization ? { authorization } : {}),
    },
  });

describe("server axios 공개 조회 인증정보 전달 경계", () => {
  it("익명 요청은 빈 Authorization 및 Cookie 헤더를 전송하지 않는다", () => {
    const client = createServerAxios(request());

    expect(client.defaults.headers.Authorization).toBeUndefined();
    expect(client.defaults.headers.Cookie).toBeUndefined();
  });

  it("로그인 요청은 access token과 원본 쿠키를 전달한다", () => {
    const client = createServerAxios(
      request("theme=dark; access_token=valid-access; locale=ko"),
    );

    expect(client.defaults.headers.Authorization).toBe("Bearer valid-access");
    expect(client.defaults.headers.Cookie).toBe(
      "theme=dark; access_token=valid-access; locale=ko",
    );
  });

  it("명시적인 Authorization 헤더가 access token 쿠키보다 우선한다", () => {
    const client = createServerAxios(
      request("access_token=cookie-access", "Bearer header-access"),
    );

    expect(client.defaults.headers.Authorization).toBe("Bearer header-access");
  });
});

describe("auth axios 인증정보 전달 경계", () => {
  it("refresh는 만료 access와 무관한 쿠키를 제외하고 refresh만 전달한다", () => {
    const client = createAuthServerAxios(
      request(
        "access_token=expired; other=unused; refresh_token=valid-refresh",
        "Bearer expired",
      ),
      "refresh",
    );
    expect(client.defaults.headers.Cookie).toBe("refresh_token=valid-refresh");
    expect(client.defaults.headers.Authorization).toBeUndefined();
    expect(client.defaults.maxRedirects).toBe(0);
  });
  it("refresh가 없으면 access 인증으로 대체하지 않는다", () => {
    const client = createAuthServerAxios(
      request("access_token=expired", "Bearer expired"),
      "refresh",
    );
    expect(client.defaults.headers.Cookie).toBeUndefined();
    expect(client.defaults.headers.Authorization).toBeUndefined();
  });
  it("login은 기존 access와 refresh를 모두 보내지 않는다", () => {
    const client = createAuthServerAxios(
      request("access_token=old; refresh_token=old", "Bearer old"),
      "none",
    );
    expect(client.defaults.headers.Cookie).toBeUndefined();
    expect(client.defaults.headers.Authorization).toBeUndefined();
  });
  it("me/logout은 access 쿠키를 Bearer로 전달해 서버가 principal을 확인할 수 있게 한다", () => {
    const client = createAuthServerAxios(
      request("access_token=valid-access; refresh_token=valid-refresh"),
    );
    expect(client.defaults.headers.Authorization).toBe("Bearer valid-access");
    expect(client.defaults.headers.Cookie).toBe(
      "access_token=valid-access; refresh_token=valid-refresh",
    );
  });
  it("인증 요청과 실패의 body, 쿠키, AxiosError를 로깅하지 않는다", async () => {
    const spies = [
      jest.spyOn(console, "log"),
      jest.spyOn(console, "debug"),
      jest.spyOn(console, "info"),
      jest.spyOn(console, "warn"),
      jest.spyOn(console, "error"),
    ];
    try {
      const client = createAuthServerAxios(
        request(
          "access_token=synthetic-access; refresh_token=synthetic-refresh",
        ),
      );
      const error = new axios.AxiosError("failed");
      client.defaults.adapter = async (config) => {
        error.config = config;
        throw error;
      };
      await expect(
        client.post("/das/api/auth/login", {
          email: "local@example.test",
          password: "synthetic-password",
        }),
      ).rejects.toBe(error);
      for (const spy of spies) expect(spy).not.toHaveBeenCalled();
    } finally {
      spies.forEach((spy) => spy.mockRestore());
    }
  });
});
