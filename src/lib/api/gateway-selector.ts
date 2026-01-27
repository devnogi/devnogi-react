/**
 * Gateway URL 선택 헬퍼 (서버 사이드 전용)
 *
 * 환경 변수:
 * - GATEWAY_URL: 게이트웨이 URL
 */

export class GatewayConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GatewayConfigError";
  }
}

export function selectServerGatewayUrl(): string {
  const gatewayUrl = process.env.GATEWAY_URL;

  if (!gatewayUrl) {
    const errorMsg =
      "게이트웨이 환경 변수가 설정되지 않았습니다. GATEWAY_URL을 .env 파일에 추가하세요.";
    console.error("[gateway-selector]", errorMsg);
    throw new GatewayConfigError(errorMsg);
  }

  return gatewayUrl;
}
