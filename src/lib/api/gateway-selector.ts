/**
 * Gateway URL 선택 헬퍼
 *
 * 환경에 따라 적절한 게이트웨이 URL을 선택합니다.
 * - 프로덕션: NEXT_PUBLIC_GATEWAY_PROD_URL 사용
 * - 개발: NEXT_PUBLIC_GATEWAY_DEV_URL 사용
 * - 로컬 개발 시 특정 마이크로서비스만 로컬 게이트웨이를 사용하도록 설정 가능
 *
 * 환경 변수:
 * - NEXT_PUBLIC_GATEWAY_PROD_URL: 프로덕션 게이트웨이 URL
 * - NEXT_PUBLIC_GATEWAY_DEV_URL: 개발 서버 게이트웨이 URL (예: http://168.107.43.221:8080)
 * - NEXT_PUBLIC_GATEWAY_LOCAL_URL: 로컬 게이트웨이 URL (예: http://localhost:8090)
 * - NEXT_PUBLIC_USE_LOCAL_GATEWAY_FOR: 로컬 게이트웨이를 사용할 서비스 목록 (쉼표로 구분, 예: auth,community)
 *
 * 서비스 매핑:
 * - auth: /das/** (인증 서버)
 * - community: /dcs/** (커뮤니티 서버)
 * - batch: /oab/** (배치 서버)
 */

// 서비스 prefix 매핑
const SERVICE_PREFIX_MAP: Record<string, string> = {
  auth: "/das",
  community: "/dcs",
  batch: "/oab",
};

/**
 * 요청 경로에서 서비스 이름 추출
 */
function getServiceFromPath(path: string): string | null {
  for (const [service, prefix] of Object.entries(SERVICE_PREFIX_MAP)) {
    if (path.startsWith(prefix)) {
      return service;
    }
  }
  return null;
}

/**
 * 환경에 따른 기본 게이트웨이 URL 반환
 * 프로덕션 환경에서는 PROD URL, 그 외에는 DEV URL 사용
 */
function getDefaultGatewayUrl(): string {
  const isProduction = process.env.NODE_ENV === "production";
  const prodUrl = process.env.NEXT_PUBLIC_GATEWAY_PROD_URL;
  const devUrl = process.env.NEXT_PUBLIC_GATEWAY_DEV_URL;

  if (isProduction) {
    if (prodUrl) return prodUrl;
    if (devUrl) return devUrl;
    throw new Error(
      "프로덕션 환경에서 NEXT_PUBLIC_GATEWAY_PROD_URL 또는 NEXT_PUBLIC_GATEWAY_DEV_URL 환경 변수가 설정되지 않았습니다."
    );
  }

  if (devUrl) return devUrl;
  if (prodUrl) return prodUrl;
  throw new Error(
    "NEXT_PUBLIC_GATEWAY_DEV_URL 또는 NEXT_PUBLIC_GATEWAY_PROD_URL 환경 변수가 설정되지 않았습니다."
  );
}

/**
 * 게이트웨이 URL 선택
 *
 * @param path - API 요청 경로 (예: /das/auth/login, /dcs/api/posts)
 * @returns 사용할 게이트웨이 URL
 */
export function selectGatewayUrl(path: string): string {
  const localUrl = process.env.NEXT_PUBLIC_GATEWAY_LOCAL_URL;
  const useLocalFor = process.env.NEXT_PUBLIC_USE_LOCAL_GATEWAY_FOR || "";

  // 환경에 맞는 기본 게이트웨이 URL
  const defaultUrl = getDefaultGatewayUrl();

  // 로컬 게이트웨이 URL이 없으면 기본 게이트웨이 사용
  if (!localUrl) {
    return defaultUrl;
  }

  // USE_LOCAL_GATEWAY_FOR가 비어있으면 기본 게이트웨이 사용
  if (!useLocalFor.trim()) {
    return defaultUrl;
  }

  // 요청 경로에서 서비스 추출
  const service = getServiceFromPath(path);
  if (!service) {
    // 서비스를 판단할 수 없으면 기본 게이트웨이 사용
    return defaultUrl;
  }

  // 로컬 게이트웨이를 사용할 서비스 목록
  const localServices = useLocalFor.split(",").map((s) => s.trim());

  // 해당 서비스가 목록에 있으면 로컬 게이트웨이 사용
  if (localServices.includes(service)) {
    return localUrl;
  }

  // 그 외에는 기본 게이트웨이 사용
  return defaultUrl;
}

/**
 * 서버 사이드에서 게이트웨이 URL 선택
 * 클라이언트 환경 변수를 사용할 수 없으므로 별도 함수 제공
 *
 * @throws {GatewayConfigError} 환경변수가 설정되지 않은 경우
 */
export class GatewayConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GatewayConfigError";
  }
}

export function selectServerGatewayUrl(path: string): string {
  const localUrl = process.env.NEXT_PUBLIC_GATEWAY_LOCAL_URL;
  const useLocalFor = process.env.NEXT_PUBLIC_USE_LOCAL_GATEWAY_FOR || "";
  const isProduction = process.env.NODE_ENV === "production";

  // 환경에 따른 게이트웨이 URL 선택
  const prodUrl = process.env.NEXT_PUBLIC_GATEWAY_PROD_URL;
  const devUrl = process.env.NEXT_PUBLIC_GATEWAY_DEV_URL;
  const legacyUrl = process.env.GATEWAY_BASE_URL;

  // 기본 게이트웨이 URL 결정
  let defaultUrl: string | undefined;

  if (isProduction) {
    // 프로덕션: PROD_URL > GATEWAY_BASE_URL > DEV_URL 순으로 fallback
    defaultUrl = prodUrl || legacyUrl || devUrl;
  } else {
    // 개발: DEV_URL > GATEWAY_BASE_URL > PROD_URL 순으로 fallback
    defaultUrl = devUrl || legacyUrl || prodUrl;
  }

  if (!defaultUrl) {
    const errorMsg =
      "게이트웨이 환경 변수가 설정되지 않았습니다. " +
      (isProduction
        ? "NEXT_PUBLIC_GATEWAY_PROD_URL 또는 GATEWAY_BASE_URL을 설정하세요."
        : "NEXT_PUBLIC_GATEWAY_DEV_URL 또는 GATEWAY_BASE_URL을 .env 파일에 추가하세요.");
    console.error("[gateway-selector]", errorMsg);
    throw new GatewayConfigError(errorMsg);
  }

  // 로컬 게이트웨이 URL이 없으면 기본 게이트웨이 사용
  if (!localUrl) {
    return defaultUrl;
  }

  // USE_LOCAL_GATEWAY_FOR가 비어있으면 기본 게이트웨이 사용
  if (!useLocalFor.trim()) {
    return defaultUrl;
  }

  // 요청 경로에서 서비스 추출
  const service = getServiceFromPath(path);
  if (!service) {
    return defaultUrl;
  }

  // 로컬 게이트웨이를 사용할 서비스 목록
  const localServices = useLocalFor.split(",").map((s) => s.trim());

  // 해당 서비스가 목록에 있으면 로컬 게이트웨이 사용
  if (localServices.includes(service)) {
    return localUrl;
  }

  return defaultUrl;
}
