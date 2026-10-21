# 1차 설정 검증

2026-10-21, Windows, `codex/ai-workspace-phase1`. 제품 소스 변경 없이 기존 테스트 fixture·Provider·현재 API 경로를 보완했다. commit/push/배포는 수행하지 않았다.

- `npm ci --ignore-scripts --no-audit --no-fund`: 899개 패키지 설치 성공.
- Node 24 환경의 `npm run verify`: 통과. 별도 독립 검토자의 typecheck 및 Jest 11 suites/57 tests 통과.
- CI와 같은 Node 20.20.2를 공식 배포 파일과 SHA-256으로 확인해 workspace `.local/tools/`에만 준비하고 `npm run verify` 재실행: exit 0. lint, typecheck, Jest 11 suites/57 tests, Next build 모두 통과.
- 기존 img lint 경고 7개와 tooltip 테스트 CSS 경고는 남는다.
- `node scripts/secret-scan.mjs`: 0건. 실제 `.env.local`은 파일을 보존하고 Git 추적만 해제했다. 전체 Git 이력 검사·키 회전은 수행하지 않았다.
- 샘플 환경 기반 로컬 Compose config와 workflow YAML 구문 검사 통과. Docker 실제 기동은 미검증.
- 전체 로그는 공동 루트 `.local/react-node20-verify.log`; 원격 CI 실행 결과는 아직 없다.
