import { initMockServer } from "@/mocks/initServer";
import axios, { AxiosInstance } from "axios";
import { NextRequest } from "next/server";

export function createServerAxios(request: NextRequest): AxiosInstance {
  initMockServer();

  const gatewayUrl = process.env.GATEWAY_BASE_URL;
  if (!gatewayUrl) {
    throw new Error("gatewayUrl 환경 변수가 설정되지 않았습니다.");
  }

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
 * localhost:8099 게이트웨이를 통해 /das/** 경로로 라우팅됩니다
 */
export function createAuthServerAxios(request: NextRequest): AxiosInstance {
  initMockServer();

  const authBaseUrl = process.env.AUTH_BASE_URL;
  if (!authBaseUrl) {
    throw new Error("AUTH_BASE_URL 환경 변수가 설정되지 않았습니다.");
  }

  return axios.create({
    baseURL: authBaseUrl,
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
 * localhost:8099 게이트웨이를 통해 /das/** 경로로 라우팅됩니다
 */
export function createPublicAuthServerAxios(): AxiosInstance {
  initMockServer();

  const authBaseUrl = process.env.AUTH_BASE_URL;
  if (!authBaseUrl) {
    throw new Error("AUTH_BASE_URL 환경 변수가 설정되지 않았습니다.");
  }

  return axios.create({
    baseURL: authBaseUrl,
    timeout: 5000,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
