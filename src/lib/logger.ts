/* eslint-disable no-console */
/**
 * 서버 사이드 로깅 유틸리티
 *
 * 환경변수 LOG_LEVEL로 로그 레벨 제어:
 * - DEBUG: 모든 로그 출력 (개발/디버깅용)
 * - INFO: INFO 이상 출력 (기본값)
 * - WARN: WARN 이상 출력
 * - ERROR: ERROR만 출력 (운영 환경)
 */

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

const LOG_LEVELS: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

function getCurrentLogLevel(): LogLevel {
  const level = (process.env.LOG_LEVEL?.toUpperCase() as LogLevel) || "INFO";
  return LOG_LEVELS[level] !== undefined ? level : "INFO";
}

function shouldLog(level: LogLevel): boolean {
  const currentLevel = getCurrentLogLevel();
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatTimestamp(): string {
  return new Date().toISOString();
}

/**
 * JWT 토큰 마스킹 (앞 20자만 표시)
 */
export function maskJwt(token: string | null | undefined): string {
  if (!token) return "(empty)";
  if (token.length <= 20) return token;
  return `${token.substring(0, 20)}...***`;
}

/**
 * Authorization 헤더에서 토큰 추출 및 마스킹
 */
export function maskAuthHeader(authHeader: string | null | undefined): string {
  if (!authHeader) return "(empty)";
  if (authHeader.startsWith("Bearer ")) {
    return `Bearer ${maskJwt(authHeader.substring(7))}`;
  }
  return maskJwt(authHeader);
}

/**
 * 요청 정보를 포맷팅
 */
export interface RequestLogInfo {
  method: string;
  url: string;
  fullUrl?: string;
  headers?: Record<string, string | null | undefined>;
  body?: unknown;
  params?: Record<string, string>;
}

/**
 * 응답 정보를 포맷팅
 */
export interface ResponseLogInfo {
  status: number;
  statusText?: string;
  data?: unknown;
  headers?: Record<string, string>;
}

class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(level: LogLevel, message: string): string {
    return `[${formatTimestamp()}] [${level}] [${this.context}] ${message}`;
  }

  debug(message: string, data?: unknown): void {
    if (!shouldLog("DEBUG")) return;
    console.log(this.formatMessage("DEBUG", message));
    if (data !== undefined) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  info(message: string, data?: unknown): void {
    if (!shouldLog("INFO")) return;
    console.log(this.formatMessage("INFO", message));
    if (data !== undefined) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  warn(message: string, data?: unknown): void {
    if (!shouldLog("WARN")) return;
    console.warn(this.formatMessage("WARN", message));
    if (data !== undefined) {
      console.warn(JSON.stringify(data, null, 2));
    }
  }

  error(message: string, data?: unknown): void {
    if (!shouldLog("ERROR")) return;
    console.error(this.formatMessage("ERROR", message));
    if (data !== undefined) {
      console.error(JSON.stringify(data, null, 2));
    }
  }

  /**
   * API 요청 로그 (DEBUG 레벨)
   */
  logRequest(info: RequestLogInfo): void {
    if (!shouldLog("DEBUG")) return;

    const maskedHeaders = info.headers
      ? {
          ...info.headers,
          Authorization: maskAuthHeader(info.headers.Authorization),
          Cookie: info.headers.Cookie
            ? `(${info.headers.Cookie.length} chars)`
            : "(empty)",
        }
      : undefined;

    this.debug(`>>> REQUEST: ${info.method} ${info.url}`, {
      fullUrl: info.fullUrl,
      headers: maskedHeaders,
      params: info.params,
      body: info.body,
    });
  }

  /**
   * API 응답 로그 (DEBUG 레벨)
   */
  logResponse(info: ResponseLogInfo, durationMs?: number): void {
    if (!shouldLog("DEBUG")) return;

    const duration = durationMs ? ` (${durationMs}ms)` : "";
    this.debug(`<<< RESPONSE: ${info.status} ${info.statusText || ""}${duration}`, {
      data: info.data,
    });
  }

  /**
   * API 에러 로그 (ERROR 레벨)
   */
  logError(message: string, error: unknown): void {
    this.error(message, {
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}

/**
 * 컨텍스트별 로거 생성
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

/**
 * 기본 로거 (컨텍스트 없음)
 */
export const logger = new Logger("App");
