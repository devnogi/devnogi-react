/* eslint-disable no-console */
import { QueryClient } from "@tanstack/react-query";
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

/**
 * 클라이언트 사이드 API 요청 로깅 인터셉터 추가
 * 브라우저 콘솔에서 API 요청/응답을 확인할 수 있습니다
 */
function addClientLoggingInterceptors(instance: AxiosInstance): void {
  // 요청 인터셉터
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const startTime = Date.now();
      (config as InternalAxiosRequestConfig & { _startTime: number })._startTime = startTime;

      const params = config.params
        ? "?" + new URLSearchParams(config.params).toString()
        : "";
      const fullUrl = `${config.baseURL || ""}${config.url || ""}${params}`;

      console.group(
        `%c🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`,
        "color: #2196F3; font-weight: bold"
      );
      console.log("%cFull URL:", "font-weight: bold", fullUrl);
      console.log("%cMethod:", "font-weight: bold", config.method?.toUpperCase());
      console.log("%cHeaders:", "font-weight: bold", config.headers);

      // 쿠키 정보 (document.cookie에서 읽기)
      if (typeof document !== "undefined") {
        const cookies = document.cookie;
        console.log("%cBrowser Cookies:", "font-weight: bold", cookies || "(empty)");
        // 쿠키 파싱
        if (cookies) {
          const cookieObj: Record<string, string> = {};
          cookies.split(";").forEach((cookie) => {
            const [name, ...valueParts] = cookie.trim().split("=");
            if (name) {
              cookieObj[name] = valueParts.join("=");
            }
          });
          console.log("%cParsed Cookies:", "font-weight: bold", cookieObj);
        }
      }

      if (config.params) {
        console.log("%cQuery Params:", "font-weight: bold", config.params);
      }

      if (config.data) {
        if (config.data instanceof FormData) {
          const formDataObj: Record<string, string | File> = {};
          config.data.forEach((value, key) => {
            formDataObj[key] = value instanceof File ? `[File: ${value.name}]` : value;
          });
          console.log("%cBody (FormData):", "font-weight: bold", formDataObj);
        } else {
          console.log("%cBody:", "font-weight: bold", config.data);
        }
      }

      console.groupEnd();

      return config;
    },
    (error) => {
      console.error("%c❌ Request Error:", "color: red; font-weight: bold", error.message);
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터
  instance.interceptors.response.use(
    (response) => {
      const config = response.config as InternalAxiosRequestConfig & { _startTime?: number };
      const duration = config._startTime ? Date.now() - config._startTime : 0;

      console.group(
        `%c✅ API Response: ${response.status} ${config.url} (${duration}ms)`,
        "color: #4CAF50; font-weight: bold"
      );
      console.log("%cStatus:", "font-weight: bold", response.status, response.statusText);
      console.log("%cDuration:", "font-weight: bold", `${duration}ms`);
      console.log("%cResponse Headers:", "font-weight: bold", response.headers);
      console.log("%cResponse Data:", "font-weight: bold", response.data);
      console.groupEnd();

      return response;
    },
    (error) => {
      const config = error.config as InternalAxiosRequestConfig & { _startTime?: number };
      const duration = config?._startTime ? Date.now() - config._startTime : 0;

      console.group(
        `%c❌ API Error: ${config?.url} (${duration}ms)`,
        "color: #f44336; font-weight: bold"
      );

      if (error.response) {
        console.log("%cStatus:", "font-weight: bold", error.response.status);
        console.log("%cResponse Data:", "font-weight: bold", error.response.data);
        console.log("%cResponse Headers:", "font-weight: bold", error.response.headers);
      } else if (error.request) {
        console.log("%cNo Response:", "font-weight: bold", "서버에서 응답이 없습니다");
        console.log("%cError Code:", "font-weight: bold", error.code);
        console.log("%cError Message:", "font-weight: bold", error.message);
      } else {
        console.log("%cRequest Setup Error:", "font-weight: bold", error.message);
      }

      console.groupEnd();

      return Promise.reject(error);
    }
  );
}

export const clientAxios: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 5000,
});

// 401 자동 갱신 인터셉터
let isRefreshing = false;
let refreshSubscribers: Array<(error?: Error) => void> = [];

function onRefreshSuccess() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

function onRefreshFailure(error: Error) {
  refreshSubscribers.forEach((cb) => cb(error));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (error?: Error) => void) {
  refreshSubscribers.push(callback);
}

clientAxios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401이 아니거나, 이미 재시도한 요청이면 그대로 reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // refresh 요청 자체가 401이면 무한 루프 방지
    if (originalRequest.url === "/auth/refresh") {
      return Promise.reject(error);
    }

    // 이미 refresh 진행 중이면 대기 큐에 추가
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        addRefreshSubscriber((err?: Error) => {
          if (err) {
            reject(err);
          } else {
            originalRequest._retry = true;
            resolve(clientAxios(originalRequest));
          }
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await axios.post("/api/auth/refresh", {}, { withCredentials: true });
      onRefreshSuccess();
      return clientAxios(originalRequest);
    } catch (refreshError) {
      onRefreshFailure(refreshError instanceof Error ? refreshError : new Error("Token refresh failed"));
      // refresh 실패 시 로그인 페이지로 리다이렉트
      if (typeof window !== "undefined") {
        window.location.href = "/sign-in";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// 클라이언트 사이드에서만 로깅 인터셉터 추가
if (typeof window !== "undefined") {
  addClientLoggingInterceptors(clientAxios);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 200, // 쿼리 fresh 유지 기간 0.2초 (ms)
      refetchOnWindowFocus: false, // 포커스 복귀 시 재요청 끔
      refetchOnReconnect: false, // 네트워크 재연결 시 재요청 끔
      refetchOnMount: false, // 마운트 시 재요청 끔
    },
  },
});
