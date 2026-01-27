# DevNogi React - Production Deployment Guide

이 가이드는 DevNogi React 프로젝트를 운영 서버에 배포하는 방법을 설명합니다.

## 목차

1. [사전 준비사항](#사전-준비사항)
2. [GitHub Secrets 설정](#github-secrets-설정)
3. [환경 변수 설정](#환경-변수-설정)
4. [배포 프로세스](#배포-프로세스)
5. [Health Check](#health-check)
6. [롤백 방법](#롤백-방법)
7. [문제 해결](#문제-해결)

## 사전 준비사항

### 1. Docker Hub 계정
- Docker Hub 계정이 필요합니다
- Repository를 생성합니다 (예: `your-username/devnogi-react`)

### 2. 운영 서버
- Docker 및 Docker Compose가 설치된 Linux 서버
- SSH 접근이 가능해야 합니다
- 포트 80 (또는 원하는 포트)가 열려있어야 합니다

### 3. Next.js Health Check API
- `/api/health` 엔드포인트가 구현되어 있어야 합니다
- 응답 형식: `{ "status": "ok" }`

**예시 구현** (`src/app/api/health/route.ts`):
```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
```

## GitHub Secrets 설정

GitHub Repository > Settings > Secrets and variables > Actions로 이동하여 다음 Secrets를 추가하세요:

### Docker Hub 정보
| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DOCKER_USERNAME` | Docker Hub 사용자명 | `myusername` |
| `DOCKER_PASSWORD` | Docker Hub 비밀번호 또는 Access Token | `dckr_pat_...` |
| `DOCKER_REPO` | Docker Repository 이름 | `devnogi-react` |

### SSH 접근 정보
| Secret Name | Description | Example |
|-------------|-------------|---------|
| `PROD_SSH_PRIVATE_KEY` | SSH 개인 키 (전체 내용) | `-----BEGIN RSA PRIVATE KEY-----...` |
| `PROD_SERVER_HOST` | 운영 서버 호스트 주소 | `123.456.789.10` |
| `PROD_SERVER_USER` | SSH 사용자명 | `ubuntu` |

### 환경 변수 파일
| Secret Name | Description |
|-------------|-------------|
| `ENV_FILE_PROD` | `.env.prod` 파일의 전체 내용 (아래 참조) |

### 선택적 설정
| Secret Name | Description | Default |
|-------------|-------------|---------|
| `NGINX_PORT` | Nginx가 사용할 포트 | `80` |

## 환경 변수 설정

### 1. `.env.prod` 파일 생성

`.sample_env.prod` 파일을 참고하여 실제 운영 환경 변수를 작성합니다:

```bash
# 실제 값으로 변경하세요
NODE_ENV=production
PORT=3010
VERCEL_ENV=production
API_MOCKING=disabled

# 실제 운영 게이트웨이 URL로 변경
GATEWAY_URL=http://your-production-gateway:8080

# Docker Hub 정보 (GitHub Secrets와 동일)
DOCKER_USERNAME=your-dockerhub-username
DOCKER_REPO=devnogi-react

# Resource Limits
DOCKER_CPU_LIMIT=2.0
DOCKER_CPU_RESERVATION=1.0
DOCKER_MEMORY_LIMIT=2g
DOCKER_MEMORY_RESERVATION=1g

# Nginx Port
NGINX_PORT=80

# Health Check
HEALTHCHECK_INTERVAL=30s
HEALTHCHECK_TIMEOUT=10s
HEALTHCHECK_RETRIES=5
HEALTHCHECK_START_PERIOD=120s

# Autoheal
AUTOHEAL_INTERVAL=60
AUTOHEAL_START_PERIOD=300
AUTOHEAL_DEFAULT_STOP_TIMEOUT=30
AUTOHEAL_MEMORY_LIMIT=50m
AUTOHEAL_MEMORY_RESERVATION=20m

# Logging
LOGGING_MAX_SIZE=50m
LOGGING_MAX_FILE=10
```

### 2. GitHub Secret에 환경 변수 추가

위에서 작성한 `.env.prod` 파일의 **전체 내용**을 복사하여 GitHub Secret `ENV_FILE_PROD`에 추가합니다:

```bash
# .env.prod 파일 내용을 복사
cat .env.prod | pbcopy  # macOS
cat .env.prod | xclip -selection clipboard  # Linux
```

그 다음 GitHub > Settings > Secrets > New repository secret:
- Name: `ENV_FILE_PROD`
- Value: (복사한 내용 붙여넣기)

## 배포 프로세스

### 자동 배포 (권장)

1. **main 브랜치에 Push**
   ```bash
   git checkout main
   git pull origin main
   git merge your-feature-branch
   git push origin main
   ```

2. **GitHub Actions 자동 실행**
   - GitHub Actions 탭에서 진행 상황 확인
   - 다음 단계가 자동으로 실행됩니다:
     - ✅ Lint 및 Test
     - ✅ Docker 이미지 빌드 및 Push
     - ✅ 운영 서버에 배포
     - ✅ Health Check

3. **배포 확인**
   - GitHub Actions가 성공적으로 완료되면 배포 완료
   - 브라우저에서 `http://your-server-ip` 접속하여 확인

### 수동 배포

SSH로 서버에 접속하여 수동으로 배포할 수 있습니다:

```bash
# 1. 서버 접속
ssh -i your-key.pem user@your-server-ip

# 2. 앱 디렉토리로 이동
cd ~/devnogi-react

# 3. 최신 이미지 Pull
docker pull your-username/devnogi-react:prod

# 4. 재배포
docker compose -f docker-compose-prod.yaml down
docker compose -f docker-compose-prod.yaml up -d

# 5. 로그 확인
docker logs -f nextjs-app-prod
```

## Health Check

### 자동 Health Check

GitHub Actions 워크플로우는 배포 후 자동으로 Health Check를 수행합니다:

1. **Container 실행 확인**: Next.js 및 Nginx 컨테이너 실행 확인
2. **Docker Health Check**: 컨테이너가 healthy 상태가 될 때까지 대기 (최대 6분)
3. **Health Endpoint 확인**: `/api/health` 엔드포인트 응답 확인 (최대 5분)
4. **Smoke Test**: HTTP 200 응답 확인

### 수동 Health Check

서버에서 직접 확인:

```bash
# 1. 컨테이너 상태 확인
docker ps --filter "name=nextjs-app-prod"
docker ps --filter "name=nginx-proxy-prod"

# 2. Health Check 상태 확인
docker inspect --format='{{.State.Health.Status}}' nextjs-app-prod
docker inspect --format='{{.State.Health.Status}}' nginx-proxy-prod

# 3. Health Endpoint 테스트
curl http://localhost/api/health
# 응답: {"status":"ok"}

# 4. 로그 확인
docker logs nextjs-app-prod --tail 100
docker logs nginx-proxy-prod --tail 50
```

## 롤백 방법

배포에 실패하거나 문제가 발생한 경우 이전 버전으로 롤백할 수 있습니다.

### 방법 1: 이전 SHA로 롤백

```bash
# 1. 서버 접속
ssh -i your-key.pem user@your-server-ip

# 2. 앱 디렉토리로 이동
cd ~/devnogi-react

# 3. 이전 버전 이미지 Pull
docker pull your-username/devnogi-react:prod-<previous-commit-sha>

# 4. docker-compose.yaml 수정하여 이전 이미지 사용
# image: your-username/devnogi-react:prod-<previous-commit-sha>

# 5. 재배포
docker compose -f docker-compose-prod.yaml down
docker compose -f docker-compose-prod.yaml up -d
```

### 방법 2: 태그로 롤백

특정 버전의 태그가 있는 경우:

```bash
docker pull your-username/devnogi-react:v1.0.0
# docker-compose.yaml에서 이미지 태그 변경 후 재배포
```

## 문제 해결

### 1. 컨테이너가 시작되지 않는 경우

```bash
# 로그 확인
docker logs nextjs-app-prod --tail 100

# 컨테이너 상태 확인
docker ps -a

# 환경 변수 확인
docker exec nextjs-app-prod env | grep NEXT_PUBLIC
```

**일반적인 원인:**
- 환경 변수 누락 또는 잘못된 설정
- 메모리 부족
- 포트 충돌

### 2. Health Check 실패

```bash
# Health endpoint 직접 확인
curl -v http://localhost:3010/api/health  # Next.js 직접
curl -v http://localhost/api/health       # Nginx를 통해

# 컨테이너 Health 상태 확인
docker inspect --format='{{json .State.Health}}' nextjs-app-prod | jq
```

**일반적인 원인:**
- `/api/health` 엔드포인트 미구현
- Next.js 애플리케이션 시작 실패
- 네트워크 설정 오류

### 3. Nginx 502 Bad Gateway

```bash
# Nginx 로그 확인
docker logs nginx-proxy-prod --tail 50

# Next.js 컨테이너 상태 확인
docker ps --filter "name=nextjs-app-prod"

# 네트워크 연결 테스트
docker exec nginx-proxy-prod wget --spider http://nextjs-app:3010/api/health
```

**일반적인 원인:**
- Next.js 컨테이너가 실행되지 않음
- 네트워크 설정 오류
- 포트 설정 불일치

### 4. GitHub Actions 실패

**SSH 연결 실패:**
- `PROD_SSH_PRIVATE_KEY` Secret이 올바른지 확인
- SSH 키 권한 확인 (`chmod 400`)
- 서버 방화벽 설정 확인

**Docker 빌드 실패:**
- Dockerfile 문법 확인
- 빌드 로그 확인
- 디스크 공간 확인

**Health Check 타임아웃:**
- 서버 리소스 확인 (CPU, 메모리)
- Health check 시간 설정 조정 (`.github/workflows/push-cd-prod.yml`)
- 애플리케이션 시작 시간 확인

## 모니터링

### 로그 확인

```bash
# 실시간 로그 확인
docker logs -f nextjs-app-prod
docker logs -f nginx-proxy-prod

# 최근 로그 확인
docker logs nextjs-app-prod --tail 100
docker logs nginx-proxy-prod --tail 50

# 특정 시간 이후 로그
docker logs nextjs-app-prod --since 30m
```

### 리소스 사용량 확인

```bash
# 컨테이너 리소스 사용량
docker stats nextjs-app-prod nginx-proxy-prod

# 디스크 사용량
docker system df
```

### Autoheal 로그 확인

```bash
# Autoheal 컨테이너 로그
docker logs autoheal-nextjs-prod --tail 50

# Autoheal이 재시작한 컨테이너 확인
docker logs autoheal-nextjs-prod | grep "Restarting"
```

## 보안 권장사항

1. **SSH 키 관리**
   - SSH 개인 키를 안전하게 보관
   - 정기적으로 키 교체
   - 필요한 경우에만 접근 권한 부여

2. **GitHub Secrets**
   - 민감한 정보는 모두 Secrets로 관리
   - 정기적으로 비밀번호 및 토큰 교체
   - 최소 권한 원칙 적용

3. **환경 변수**
   - `.env.prod` 파일을 절대 Git에 커밋하지 말 것
   - `.gitignore`에 `.env.*` 추가 확인

4. **Docker Hub**
   - Private Repository 사용 권장
   - Access Token 사용 (비밀번호 대신)
   - 정기적으로 이미지 스캔

5. **운영 서버**
   - 방화벽 설정 (필요한 포트만 개방)
   - 정기적인 보안 업데이트
   - 로그 모니터링 및 분석

## 추가 리소스

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Nginx Documentation](https://nginx.org/en/docs/)

## 지원

문제가 발생하거나 질문이 있으면 다음을 확인하세요:

1. GitHub Actions 로그
2. 서버 컨테이너 로그
3. 이 가이드의 문제 해결 섹션

추가 도움이 필요한 경우 팀에 문의하세요.
