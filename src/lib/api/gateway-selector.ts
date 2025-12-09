/**
 * Gateway URL 선택 헬퍼
 *
 * 로컬 개발 시 특정 마이크로서비스만 로컬 게이트웨이를 사용하도록 설정할 수 있습니다.
 *
 * 환경 변수:
 * - NEXT_PUBLIC_GATEWAY_LOCAL_URL: 로컬 게이트웨이 URL (예: http://localhost:8090)
 * - NEXT_PUBLIC_GATEWAY_DEV_URL: 개발 서버 게이트웨이 URL (예: http://168.107.43.221:8080)
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
 * 게이트웨이 URL 선택
 *
 * @param path - API 요청 경로 (예: /das/auth/login, /dcs/api/posts)
 * @returns 사용할 게이트웨이 URL
 */
export function selectGatewayUrl(path: string): string {
  const localUrl = process.env.NEXT_PUBLIC_GATEWAY_LOCAL_URL;
  const devUrl = process.env.NEXT_PUBLIC_GATEWAY_DEV_URL;
  const useLocalFor = process.env.NEXT_PUBLIC_USE_LOCAL_GATEWAY_FOR || "";

  // 기본값: 개발 서버 게이트웨이
  if (!devUrl) {
    throw new Error("NEXT_PUBLIC_GATEWAY_DEV_URL 환경 변수가 설정되지 않았습니다.");
  }

  // 로컬 게이트웨이 URL이 없으면 개발 서버 게이트웨이 사용
  if (!localUrl) {
    return devUrl;
  }

  // USE_LOCAL_GATEWAY_FOR가 비어있으면 개발 서버 게이트웨이 사용
  if (!useLocalFor.trim()) {
    return devUrl;
  }

  // 요청 경로에서 서비스 추출
  const service = getServiceFromPath(path);
  if (!service) {
    // 서비스를 판단할 수 없으면 개발 서버 게이트웨이 사용
    return devUrl;
  }

  // 로컬 게이트웨이를 사용할 서비스 목록
  const localServices = useLocalFor.split(",").map((s) => s.trim());

  // 해당 서비스가 목록에 있으면 로컬 게이트웨이 사용
  if (localServices.includes(service)) {
    return localUrl;
  }

  // 그 외에는 개발 서버 게이트웨이 사용
  return devUrl;
}

/**
 * 서버 사이드에서 게이트웨이 URL 선택
 * 클라이언트 환경 변수를 사용할 수 없으므로 별도 함수 제공
 */
export function selectServerGatewayUrl(path: string): string {
  const localUrl = process.env.GATEWAY_LOCAL_URL;
  const devUrl = process.env.GATEWAY_DEV_URL;
  const useLocalFor = process.env.USE_LOCAL_GATEWAY_FOR || "";

  // 기본값: 개발 서버 게이트웨이
  if (!devUrl) {
    // fallback to legacy env var
    const legacyUrl = process.env.GATEWAY_BASE_URL;
    if (!legacyUrl) {
      throw new Error("GATEWAY_DEV_URL 또는 GATEWAY_BASE_URL 환경 변수가 설정되지 않았습니다.");
    }
    return legacyUrl;
  }

  // 로컬 게이트웨이 URL이 없으면 개발 서버 게이트웨이 사용
  if (!localUrl) {
    return devUrl;
  }

  // USE_LOCAL_GATEWAY_FOR가 비어있으면 개발 서버 게이트웨이 사용
  if (!useLocalFor.trim()) {
    return devUrl;
  }

  // 요청 경로에서 서비스 추출
  const service = getServiceFromPath(path);
  if (!service) {
    return devUrl;
  }

  // 로컬 게이트웨이를 사용할 서비스 목록
  const localServices = useLocalFor.split(",").map((s) => s.trim());

  // 해당 서비스가 목록에 있으면 로컬 게이트웨이 사용
  if (localServices.includes(service)) {
    return localUrl;
  }

  return devUrl;
}
