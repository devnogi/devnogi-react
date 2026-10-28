# 로컬 개발과 검증

Node.js 20과 npm을 사용합니다. `package-lock.json`을 보존하고 `npm ci`로 설치합니다.

```sh
npm ci
npm run verify
```

`verify`는 lint, TypeScript 검사, Jest, Next.js build를 순서대로 실행하고 첫 실패에서 중단합니다. CI의 `verify`도 같은 명령을 실행합니다. build만 성공해도 lint가 성공한 것은 아닙니다. 테스트 데이터는 기존 `src/mocks/`와 테스트 파일의 fixture를 사용합니다. 운영 자격 증명은 필요하지 않습니다.

## Docker 개발 서버

### 이메일 로그인

auth와 gateway가 먼저 실행되어야 합니다. 공동 루트의 로컬 인프라로 `auth` 스키마를 준비하고 auth의 정상 가입 API로 합성 계정을 만든 뒤 `/sign-in`에서 이메일과 비밀번호로 로그인합니다. 계정 lock을 수동으로 넣지 않습니다. 이 흐름은 운영 자격 증명이나 실제 OAuth 제공자 호출을 사용하지 않습니다.

auth와 웹에 같은 쿠키 설정을 사용하세요. 로컬 HTTP는 `JWT_COOKIE_DOMAIN=`(Domain 생략), `JWT_COOKIE_SECURE=false`, `JWT_COOKIE_SAME_SITE=Lax`입니다. 환경 변수를 생략하면 기존 운영 기본값 `.memonogi.com`, `true`, `None`을 사용합니다. 실제 `.env.local`은 추적하거나 덮어쓰지 않습니다.

계약 원본은 auth 저장소의 `contracts/openapi.yaml`입니다. BFF `/api/auth/login`, `/api/auth/me`, `/api/auth/refresh`, `/api/auth/logout`은 각각 gateway의 `/das/api/auth/login`, `/das/api/user/info`, `/das/api/auth/refresh`, `/das/api/auth/logout`으로 연결됩니다. 이메일 로그인 body는 `{email,password}`이며 사용자 DTO는 그대로 전달합니다. BFF는 upstream 4xx/5xx를 유지하고 예상하지 않은 redirect나 HTML은 502로 처리합니다.

refresh는 `refresh_token` 쿠키만 전달합니다. 만료한 access 쿠키와 Bearer를 다시 보내 gateway에서 차단되지 않도록 합니다. 정상 logout은 access 인증을 전달해 서버 refresh 폐기를 요청하고 삭제 쿠키를 전달합니다. 서버 실패 시에는 같은 scope의 브라우저 쿠키만 지우며, 실패 상태를 200으로 바꾸거나 서버 폐기를 보장하지 않습니다.

회귀 테스트는 `src/app/(auth)/sign-in/page.test.tsx`(실제 AuthContext 연결), `src/app/api/auth/auth-routes.test.ts`(HTTP/쿠키 계약), `src/lib/api/server.test.ts`(credential 전달 경계)에서 실행합니다. 실제 브라우저 검증은 `API_MOCKING=disabled`로 로그인 → 사용자 조회 → 새로고침 → refresh → logout 순서로 확인합니다.

1. Docker Desktop/Linux 엔진과 로컬 게이트웨이(호스트 포트 8090)를 준비합니다.
2. 기존 `.env.local`이 있으면 내용을 확인하고 보존하세요. 새 환경에서는 `.env.example`을 `.env.local`로 복사합니다. 샘플의 `GATEWAY_URL`은 Docker에서 호스트의 로컬 게이트웨이를 가리킵니다.
3. 다음 명령은 이 저장소 폴더에서 실행합니다.

```sh
docker compose -f docker-compose-local.yml --env-file .env.local config --quiet
docker compose -f docker-compose-local.yml --env-file .env.local up nextjs-app
```

브라우저에서 `http://localhost:3010`에 접속합니다. 종료는 `docker compose -f docker-compose-local.yml --env-file .env.local down`입니다. 소스는 bind mount, 의존성·빌드 캐시는 Docker volume에 저장됩니다. 운영 Compose와 자동 복구용 Docker socket을 사용하지 않습니다.

호스트에서 `npm run dev`를 실행할 때는 `GATEWAY_URL=http://localhost:8090`을 사용합니다. `API_MOCKING=enabled`는 일부 요청만 모킹하고 일치하지 않는 요청은 실제 게이트웨이로 전달하므로 백엔드 완전 격리 모드가 아닙니다.

## CI와 배포

PR의 필수 검사 이름은 `verify`, `secret-scan`이며 승인자 수는 0명입니다. 파일 추가만으로 GitHub 보호 설정이 활성화되지는 않습니다. `node scripts/secret-scan.mjs`는 현재 파일의 기본 비밀값 패턴과 추적되는 환경 파일을 검사하며, 값은 출력하지 않습니다. Git 이력 전체 검사나 유출 자격 증명 교체를 대신하지 않습니다.

`Production Deployment`는 `main` push로 자동 실행되며, 복구할 때 `main`에서 `workflow_dispatch`로 수동 실행할 수도 있습니다. 동일 커밋을 검증하고 빌드한 이미지 digest를 배포합니다. 배포 전 기존 이미지와 Compose를 보존하고 상태 검사 실패 시 기존 이미지로 복구합니다. 이전 이미지가 없으면 배포를 중단합니다. GitHub `production` environment는 운영 secret과 배포 기록을 유지하며 `main`만 허용하도록 설정합니다.

이번 설정에서 `.env.local`은 로컬 파일을 보존하고 Git 추적만 해제했습니다. 기존 Git 이력은 그대로 남으므로 실제 비밀값이 있었는지는 관리자가 확인해야 합니다. 파일 내용을 출력하지 않았고 자격 증명을 교체했다고 주장하지 않습니다.
