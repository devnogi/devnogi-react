# 로컬 개발과 검증

Node.js 20과 npm을 사용합니다. `package-lock.json`을 보존하고 `npm ci`로 설치합니다.

```sh
npm ci
npm run verify
```

`verify`는 lint, TypeScript 검사, Jest, Next.js build를 순서대로 실행하고 첫 실패에서 중단합니다. CI의 `verify`도 같은 명령을 실행합니다. build만 성공해도 lint가 성공한 것은 아닙니다. 테스트 데이터는 기존 `src/mocks/`와 테스트 파일의 fixture를 사용합니다. 운영 자격 증명은 필요하지 않습니다.

## Docker 개발 서버

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

PR의 필수 검사 이름은 `verify`, `secret-scan`입니다. 저장소 Ruleset에서 이 검사들과 사람 리뷰 1개를 필수 조건으로 지정해야 서버에서 병합이 차단됩니다. 파일 추가만으로 GitHub 보호 설정이 활성화되지는 않습니다. `node scripts/secret-scan.mjs`는 현재 파일의 기본 비밀값 패턴과 추적되는 환경 파일을 검사하며, 값은 출력하지 않습니다. Git 이력 전체 검사나 유출 자격 증명 교체를 대신하지 않습니다.

`Manual Production Deployment`는 `main`에서 `workflow_dispatch`로만 실행됩니다. GitHub `production` environment에 필요한 리뷰어와 배포 브랜치 제한을 설정하세요. 배포에는 별도 사람 승인이 필요합니다.

이번 설정에서 `.env.local`은 로컬 파일을 보존하고 Git 추적만 해제했습니다. 기존 Git 이력은 그대로 남으므로 실제 비밀값이 있었는지는 관리자가 확인해야 합니다. 파일 내용을 출력하지 않았고 자격 증명을 교체했다고 주장하지 않습니다.
