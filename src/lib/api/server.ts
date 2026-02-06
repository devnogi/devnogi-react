import { initMockServer } from "@/mocks/initServer";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { NextRequest } from "next/server";
import { selectServerGatewayUrl } from "./gateway-selector";
import { createLogger, maskAuthHeader, maskJwt } from "@/lib/logger";

const serverLogger = createLogger("ServerAxios");
const authLogger = createLogger("AuthServerAxios");

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
 * Cookie 문자열을 파싱하여 모든 쿠키를 객체로 반환
 */
function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};

  const result: Record<string, string> = {};
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.split("=");
    if (name) {
      result[name] = valueParts.join("=");
    }
  }
  return result;
}

/**
 * 쿠키 값을 마스킹하여 로깅용 문자열 생성
 * access_token, refresh_token 등 민감한 쿠키는 일부만 표시
 */
function maskCookiesForLogging(cookies: Record<string, string>): Record<string, string> {
  const masked: Record<string, string> = {};
  const sensitiveKeys = ["access_token", "refresh_token", "session", "sid"];

  for (const [key, value] of Object.entries(cookies)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
      masked[key] = value.length > 20 ? `${value.substring(0, 20)}...***` : value;
    } else {
      masked[key] = value;
    }
  }
  return masked;
}

/**
 * axios 인스턴스에 요청/응답 로깅 interceptor 추가
 */
function addLoggingInterceptors(
  instance: AxiosInstance,
  logger: ReturnType<typeof createLogger>
): void {
  // 요청 interceptor
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // 요청 시작 시간 저장 (응답에서 duration 계산용)
      (config as InternalAxiosRequestConfig & { _startTime: number })._startTime = Date.now();

      // 전체 URL 구성
      const baseURL = config.baseURL || "";
      const url = config.url || "";
      const params = config.params
        ? "?" + new URLSearchParams(config.params).toString()
        : "";
      const fullUrl = `${baseURL}${url}${params}`;

      logger.debug(`>>> REQUEST: ${config.method?.toUpperCase()} ${url}`);
      logger.debug(`    Full URL: ${fullUrl}`);
      logger.debug(`    Authorization: ${maskAuthHeader(config.headers?.Authorization as string)}`);

      if (config.headers?.Cookie) {
        const cookieStr = config.headers.Cookie as string;
        logger.debug(`    Cookie length: ${cookieStr.length} chars`);
        // access_token 쿠키 존재 여부 확인
        const hasAccessToken = cookieStr.includes("access_token=");
        logger.debug(`    Has access_token cookie: ${hasAccessToken}`);
      }

      if (config.params) {
        logger.debug(`    Query params:`, config.params);
      }

      if (config.data) {
        // FormData인 경우 내용 요약만 출력
        if (config.data instanceof FormData) {
          const formDataKeys: string[] = [];
          config.data.forEach((_, key) => formDataKeys.push(key));
          logger.debug(`    Body (FormData keys): ${formDataKeys.join(", ")}`);
        } else {
          logger.debug(`    Body:`, config.data);
        }
      }

      return config;
    },
    (error) => {
      logger.error(`✖ REQUEST ERROR: ${error.message}`);
      return Promise.reject(error);
    }
  );

  // 응답 interceptor
  instance.interceptors.response.use(
    (response) => {
      const config = response.config as InternalAxiosRequestConfig & { _startTime?: number };
      const duration = config._startTime ? Date.now() - config._startTime : 0;

      logger.debug(`<<< RESPONSE: ${response.status} ${response.statusText} (${duration}ms)`);
      logger.debug(`    URL: ${config.url}`);

      // 응답 데이터 요약 (너무 길면 자름)
      const dataStr = JSON.stringify(response.data);
      if (dataStr.length > 500) {
        logger.debug(`    Data (truncated): ${dataStr.substring(0, 500)}...`);
      } else {
        logger.debug(`    Data:`, response.data);
      }

      return response;
    },
    (error) => {
      const config = error.config as InternalAxiosRequestConfig & { _startTime?: number };
      const duration = config?._startTime ? Date.now() - config._startTime : 0;

      if (error.response) {
        // 서버가 응답을 반환한 경우 (4xx, 5xx)
        logger.error(`✖ RESPONSE ERROR: ${error.response.status} (${duration}ms)`);
        logger.error(`    URL: ${config?.url}`);
        logger.error(`    Full URL: ${config?.baseURL}${config?.url}`);
        logger.error(`    Method: ${config?.method?.toUpperCase()}`);
        logger.error(`    Response data:`, error.response.data);
        logger.error(`    Response headers:`, error.response.headers);
      } else if (error.request) {
        // 요청은 전송됐지만 응답을 받지 못한 경우 (네트워크 에러, 타임아웃)
        logger.error(`✖ NO RESPONSE (${duration}ms)`);
        logger.error(`    URL: ${config?.url}`);
        logger.error(`    Full URL: ${config?.baseURL}${config?.url}`);
        logger.error(`    Error code: ${error.code}`); // ECONNREFUSED, ETIMEDOUT 등
        logger.error(`    Error message: ${error.message}`);
      } else {
        // 요청 설정 중 에러
        logger.error(`✖ REQUEST SETUP ERROR: ${error.message}`);
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

  // 쿠키 파싱 및 로깅
  const parsedCookies = parseCookies(cookieHeader);
  const maskedCookies = maskCookiesForLogging(parsedCookies);

  // 디버그 로그: 인증 정보 상태
  serverLogger.info("========== Creating ServerAxios instance ==========");
  serverLogger.info(`Gateway URL: ${gatewayUrl}`);
  serverLogger.info(`Request URL: ${request.url}`);
  serverLogger.info(`Request Method: ${request.method}`);
  serverLogger.info(`--- Cookie Information ---`);
  serverLogger.info(`Cookie header present: ${!!cookieHeader}`);
  serverLogger.info(`Cookie count: ${Object.keys(parsedCookies).length}`);
  serverLogger.debug(`All cookies (masked):`, maskedCookies);
  serverLogger.info(`--- Authentication Information ---`);
  serverLogger.info(`Access token from cookie: ${accessToken ? "EXISTS" : "MISSING"}`);
  serverLogger.debug(`Access token value: ${maskJwt(accessToken)}`);
  serverLogger.info(`Auth header from request: ${authHeader ? "EXISTS" : "MISSING"}`);
  serverLogger.debug(`Auth header value: ${maskAuthHeader(authHeader)}`);
  serverLogger.info(`Final Authorization: ${authorization ? "SET" : "EMPTY"}`);
  serverLogger.debug(`Final Authorization value: ${maskAuthHeader(authorization)}`);
  serverLogger.info("====================================================");

  const instance = axios.create({
    baseURL: gatewayUrl,
    timeout: 5000,
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
      Cookie: cookieHeader ?? "",
    },
  });

  addLoggingInterceptors(instance, serverLogger);

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

  // 쿠키 파싱 및 로깅
  const parsedCookies = parseCookies(cookieHeader);
  const maskedCookies = maskCookiesForLogging(parsedCookies);

  // 디버그 로그: 인증 정보 상태 (인증 필수 API이므로 INFO 레벨)
  authLogger.info("========== Creating AuthServerAxios instance (Auth Required) ==========");
  authLogger.info(`Gateway URL: ${gatewayUrl}`);
  authLogger.info(`Request URL: ${request.url}`);
  authLogger.info(`Request Method: ${request.method}`);
  authLogger.info(`--- Cookie Information ---`);
  authLogger.info(`Cookie header present: ${!!cookieHeader}`);
  authLogger.info(`Cookie count: ${Object.keys(parsedCookies).length}`);
  authLogger.info(`Cookie names: ${Object.keys(parsedCookies).join(", ") || "(none)"}`);
  authLogger.debug(`All cookies (masked):`, maskedCookies);
  authLogger.info(`--- Authentication Information ---`);
  authLogger.info(`Access token from cookie: ${accessToken ? "EXISTS" : "MISSING"}`);
  authLogger.debug(`Access token value: ${maskJwt(accessToken)}`);
  authLogger.info(`Auth header from request: ${authHeader ? "EXISTS" : "MISSING"}`);
  authLogger.debug(`Auth header value: ${maskAuthHeader(authHeader)}`);
  authLogger.info(`Final Authorization: ${authorization ? "SET" : "EMPTY"}`);
  authLogger.debug(`Final Authorization value: ${maskAuthHeader(authorization)}`);
  authLogger.info("=======================================================================");

  // 인증이 필요한 API인데 토큰이 없는 경우 경고
  if (!authorization) {
    authLogger.warn("⚠️ AuthServerAxios created WITHOUT authorization token!");
    authLogger.warn("⚠️ This request will likely fail with 401 Unauthorized");
    authLogger.warn(`⚠️ Cookie header: ${cookieHeader ? `(${cookieHeader.length} chars)` : "(empty)"}`);
    authLogger.warn(`⚠️ Cookie names present: ${Object.keys(parsedCookies).join(", ") || "(none)"}`);
  }

  const instance = axios.create({
    baseURL: gatewayUrl,
    timeout: 5000,
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
      Cookie: cookieHeader ?? "",
    },
  });

  addLoggingInterceptors(instance, authLogger);

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

  serverLogger.debug("Creating PublicAuthServerAxios instance");
  serverLogger.debug(`    Gateway URL: ${gatewayUrl}`);

  return axios.create({
    baseURL: gatewayUrl,
    timeout: 5000,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
