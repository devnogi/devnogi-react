/**
 * 소셜 로그인/회원가입 유틸리티
 */

export type SocialProvider = "google" | "kakao" | "naver";

export interface SocialAuthResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    provider?: string;
    providerUserId?: string;
    userId?: number;
    nickname?: string;
    email?: string;
  };
}

/**
 * 소셜 로그인을 시작합니다.
 * 백엔드의 OAuth2 엔드포인트로 리다이렉트됩니다.
 *
 * @param provider - 소셜 로그인 제공자 (google, kakao, naver)
 */
export function initiateSocialLogin(provider: SocialProvider): void {
  // 현재 페이지 URL을 저장 (로그인 후 돌아오기 위함)
  const currentUrl = window.location.href;
  sessionStorage.setItem("social_login_return_url", currentUrl);

  // 로컬 게이트웨이를 통해 Auth Server의 OAuth2 엔드포인트로 이동
  const authUrl = `http://localhost:8099/das/oauth2/authorization/${provider}`;

  // 새 탭에서 소셜 로그인 팝업 열기 (더 나은 UX)
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const popup = window.open(
    authUrl,
    `social_login_${provider}`,
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
  );

  if (!popup) {
    // 팝업이 차단된 경우 현재 창에서 리다이렉트
    window.location.href = authUrl;
  }
}

/**
 * 소셜 로그인 콜백을 처리합니다.
 * OAuth2SuccessHandler의 응답을 파싱하고 적절한 동작을 수행합니다.
 *
 * @param response - OAuth2SuccessHandler의 응답
 * @returns 처리 결과 (로그인 성공 또는 회원가입 필요)
 */
export function handleSocialLoginCallback(
  response: SocialAuthResponse
): { type: "login" | "signup"; data: SocialAuthResponse } {
  if (response.code === "LOGIN_SUCCESS") {
    // 기존 사용자 로그인 성공
    return { type: "login", data: response };
  } else if (response.code === "SIGNUP_REQUIRED") {
    // 신규 사용자 - 추가 정보 입력 필요
    return { type: "signup", data: response };
  } else {
    throw new Error(response.message || "소셜 로그인에 실패했습니다");
  }
}

/**
 * 저장된 리턴 URL을 가져옵니다.
 */
export function getSocialLoginReturnUrl(): string {
  return sessionStorage.getItem("social_login_return_url") || "/";
}

/**
 * 저장된 리턴 URL을 삭제합니다.
 */
export function clearSocialLoginReturnUrl(): void {
  sessionStorage.removeItem("social_login_return_url");
}
