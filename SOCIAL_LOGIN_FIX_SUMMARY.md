# 소셜 로그인 문제 해결 요약

## 문제 현상

- 카카오 인증 완료 후 팝업창이 닫히지만 로그인 상태가 되지 않음
- Auth 서버 로그에서는 로그인 성공, DB `last_login_at` 정상 업데이트
- 브라우저 콘솔에 postMessage 오류 발생

## 원인 분석

### 1차 원인: 쿠키 도메인 미설정

**파일**: `devnogi-auth-server/src/main/java/.../CookieUtil.java`

```java
// 수정 전 - domain 설정 없음
ResponseCookie cookie = ResponseCookie.from(...)
  .httpOnly(true)
  .secure(true)
  .sameSite("None")
  .path("/")
  .maxAge(...)
  .build();
```

**문제점**:
- `domain` 속성을 명시하지 않으면 쿠키는 응답을 보낸 서버의 정확한 호스트에만 설정됨
- Auth 서버가 `api.memonogi.com`에서 쿠키를 설정하면, `www.memonogi.com`에서는 해당 쿠키에 접근 불가

**해결**:
```java
// 수정 후 - domain 추가
ResponseCookie cookie = ResponseCookie.from(...)
  .httpOnly(true)
  .secure(true)
  .sameSite("None")
  .path("/")
  .domain(".memonogi.com")  // 추가!
  .maxAge(...)
  .build();
```

### 2차 원인: postMessage origin 불일치 (핵심)

**브라우저 콘솔 에러**:
```
Failed to execute 'postMessage' on 'DOMWindow':
The target origin provided ('https://www.memonogi.com') does not match
the recipient window's origin ('https://memonogi.com').
```

**문제 상황**:
```
사용자가 memonogi.com으로 접속 (www 없음)
    ↓
소셜 로그인 버튼 클릭 → 팝업 열림
    ↓
OAuth 인증 완료 → Auth 서버가 www.memonogi.com/social-callback으로 리다이렉트
    ↓
팝업 창: https://www.memonogi.com (OAuth redirect-uri 설정값)
부모 창: https://memonogi.com (사용자가 접속한 URL)
    ↓
postMessage 호출 시 origin 불일치!
```

**코드 위치**: `devnogi-react/src/app/(auth)/social-callback/page.tsx`
```typescript
window.opener.postMessage(
  { type: "social_login_success", data: response.data },
  window.location.origin  // "https://www.memonogi.com"
);
// 하지만 부모 창(window.opener)은 "https://memonogi.com"
```

**postMessage 보안 정책**:
- `postMessage`의 두 번째 인자(targetOrigin)는 수신자 창의 origin과 정확히 일치해야 함
- `www.memonogi.com` ≠ `memonogi.com` → 메시지 전달 실패

## Nginx 수정 내용

### 수정 전 (원본)

```nginx
server {
    listen 80;
    server_name memonogi.com www.memonogi.com;  # 둘 다 동일하게 처리
    ...
}

server {
    listen 443 ssl;
    server_name memonogi.com www.memonogi.com;  # 둘 다 동일하게 처리
    ...
}
```

**문제점**: 사용자가 `memonogi.com`으로 접속하면 그대로 `memonogi.com`에서 서비스됨

### 수정 후 (www 리다이렉트)

```nginx
# memonogi.com → www.memonogi.com 리다이렉트
server {
    listen 80;
    server_name memonogi.com;
    return 301 $scheme://www.memonogi.com$request_uri;
}

# www.memonogi.com만 실제 서비스
server {
    listen 80;
    server_name www.memonogi.com;
    ...
}

# HTTPS도 동일하게 리다이렉트
server {
    listen 443 ssl;
    server_name memonogi.com;
    return 301 https://www.memonogi.com$request_uri;
}

server {
    listen 443 ssl;
    server_name www.memonogi.com;
    ...
}
```

**해결 효과**:
- 모든 사용자가 `www.memonogi.com`으로 접속하게 됨
- OAuth redirect-uri(`www.memonogi.com/social-callback`)와 부모 창의 origin이 일치
- postMessage가 정상 동작

## 수정된 파일 목록

| 파일 | 수정 내용 |
|------|----------|
| `devnogi-auth-server/.../CookieUtil.java` | `.domain(".memonogi.com")` 추가 |
| `devnogi-react/nginx-prod-www-redirect.conf` | www 리다이렉트 설정 |

## 전체 흐름 (수정 후)

```
1. 사용자가 memonogi.com 접속
   ↓
2. Nginx가 www.memonogi.com으로 301 리다이렉트
   ↓
3. 사용자가 www.memonogi.com에서 소셜 로그인 클릭
   ↓
4. 팝업: api.memonogi.com/das/oauth2/authorization/kakao
   ↓
5. 카카오 인증 완료
   ↓
6. Auth 서버: JWT 쿠키 설정 (domain: .memonogi.com)
   ↓
7. www.memonogi.com/social-callback으로 리다이렉트
   ↓
8. 팝업 창: www.memonogi.com
   부모 창: www.memonogi.com (origin 일치!)
   ↓
9. postMessage 성공 → 부모 창에서 로그인 상태 갱신
   ↓
10. 팝업 닫힘, 로그인 완료
```

## 교훈

### 1. 도메인 일관성의 중요성

- `www.example.com`과 `example.com`은 브라우저 관점에서 **다른 origin**
- 쿠키, postMessage, CORS 등 모든 브라우저 보안 정책에서 origin 일치 여부가 중요
- 서비스 초기에 하나의 도메인으로 통일하고 리다이렉트 설정 필수

### 2. 쿠키 도메인 명시

- 크로스 서브도메인 쿠키 공유가 필요하면 반드시 `domain` 속성 설정
- `.example.com` 형태로 설정하면 모든 서브도메인에서 접근 가능

### 3. OAuth 환경에서의 주의점

- OAuth redirect-uri는 **정확한 URL**이어야 함
- 프론트엔드 도메인과 redirect-uri의 도메인이 일치해야 postMessage 동작
- 개발/스테이징/운영 환경별로 redirect-uri 설정 확인 필요

---

작성일: 2026-01-30
