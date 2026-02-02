import { initMockServer } from "@/mocks/initServer";
import axios, { AxiosInstance } from "axios";
import { NextRequest } from "next/server";
import { selectServerGatewayUrl } from "./gateway-selector";

/**
 * Cookie 문자열에서 특정 쿠키 값을 추출하는 헬퍼 함수
 */
function extractCookieValue(
  cookieHeader: string | null,
  cookieName: string
): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.split("=");
    if (name === cookieName) {
      return valueParts.join("=");
    }
  }
  return null;
}

/**
 * axios 인스턴스에 요청/응답 로깅 interceptor 추가
 */
function addLoggingInterceptors(instance: AxiosInstance, label: string): void {
  // 요청 interceptor
  instance.interceptors.request.use(
    (config) => {
      return config;
    },
    (error) => {
      console.error(`[${label}] ✖ REQUEST ERROR:`, error.message);
      return Promise.reject(error);
    }
  );

  // 응답 interceptor
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response) {
        console.error(`[${label}] ✖ RESPONSE ERROR: ${error.response.status} ${error.config?.url}`);
        console.error(`[${label}]   data:`, JSON.stringify(error.response.data));
      } else if (error.request) {
        console.error(`[${label}] ✖ NO RESPONSE: ${error.config?.url}`);
        console.error(`[${label}]   message: ${error.message}`);
      } else {
        console.error(`[${label}] ✖ ERROR:`, error.message);
      }
      return Promise.reject(error);
    }
  );
}

export function createServerAxios(request: NextRequest): AxiosInstance {
  initMockServer();

  const gatewayUrl = selectServerGatewayUrl();
  const cookieHeader = request.headers.get("cookie");

  // Cookie에서 access_token 추출하여 Authorization 헤더로 변환
  const accessToken = extractCookieValue(cookieHeader, "access_token");
  const authHeader = request.headers.get("authorization");
  const authorization = authHeader || (accessToken ? `Bearer ${accessToken}` : "");

  const instance = axios.create({
    baseURL: gatewayUrl,
    timeout: 5000,
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
      Cookie: cookieHeader ?? "",
    },
  });

  addLoggingInterceptors(instance, "ServerAxios");

  return instance;
}

/**
 * Auth Server 전용 axios 인스턴스 생성 함수 (인증 필요)
 * 게이트웨이를 통해 /das/** 경로로 라우팅됩니다
 *
 * Cookie의 access_token을 추출하여 Authorization 헤더로 변환합니다.
 * (Gateway는 Authorization: Bearer <token> 형식으로 JWT를 검증함)
 */
export function createAuthServerAxios(request: NextRequest): AxiosInstance {
  initMockServer();

  const gatewayUrl = selectServerGatewayUrl();
  const cookieHeader = request.headers.get("cookie");

  // Cookie에서 access_token 추출하여 Authorization 헤더로 변환
  const accessToken = extractCookieValue(cookieHeader, "access_token");
  const authHeader = request.headers.get("authorization");
  const authorization = authHeader || (accessToken ? `Bearer ${accessToken}` : "");

  const instance = axios.create({
    baseURL: gatewayUrl,
    timeout: 5000,
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
  });

  addLoggingInterceptors(instance, "AuthServerAxios");

  return instance;
}

/**
 * Auth Server Public API 전용 axios 인스턴스 생성 함수 (인증 불필요)
 * 회원가입, 이메일/닉네임 중복 체크 등 public API에 사용
 * 게이트웨이를 통해 /das/** 경로로 라우팅됩니다
 */
export function createPublicAuthServerAxios(): AxiosInstance {
  initMockServer();

  const gatewayUrl = selectServerGatewayUrl();

  return axios.create({
    baseURL: gatewayUrl,
    timeout: 5000,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
