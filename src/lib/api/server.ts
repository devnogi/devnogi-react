import { initMockServer } from "@/mocks/initServer";
import axios, { AxiosInstance } from "axios";
import { NextRequest } from "next/server";
import { selectServerGatewayUrl } from "./gateway-selector";

export function createServerAxios(request: NextRequest): AxiosInstance {
  initMockServer();

  // 요청 경로에서 게이트웨이 URL 선택
  // 예: /das/auth/login -> auth 서비스이므로 USE_LOCAL_GATEWAY_FOR에 따라 선택
  const path = new URL(request.url).pathname;
  const gatewayUrl = selectServerGatewayUrl(path);

  return axios.create({
    baseURL: gatewayUrl,
    timeout: 5000,
    headers: {
      "Content-Type": "application/json",
      Authorization: request.headers.get("authorization") ?? "",
      Cookie: request.headers.get("cookie") ?? "",
    },
  });
}

/**
 * Auth Server 전용 axios 인스턴스 생성 함수 (인증 필요)
 * 게이트웨이를 통해 /das/** 경로로 라우팅됩니다
 */
export function createAuthServerAxios(request: NextRequest): AxiosInstance {
  initMockServer();

  // Auth 서비스는 /das 경로 사용
  const gatewayUrl = selectServerGatewayUrl("/das");

  return axios.create({
    baseURL: gatewayUrl,
    timeout: 5000,
    headers: {
      "Content-Type": "application/json",
      Authorization: request.headers.get("authorization") ?? "",
      Cookie: request.headers.get("cookie") ?? "",
    },
  });
}

/**
 * Auth Server Public API 전용 axios 인스턴스 생성 함수 (인증 불필요)
 * 회원가입, 이메일/닉네임 중복 체크 등 public API에 사용
 * 게이트웨이를 통해 /das/** 경로로 라우팅됩니다
 */
export function createPublicAuthServerAxios(): AxiosInstance {
  initMockServer();

  // Auth 서비스는 /das 경로 사용
  const gatewayUrl = selectServerGatewayUrl("/das");

  return axios.create({
    baseURL: gatewayUrl,
    timeout: 5000,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
