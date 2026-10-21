# 프런트엔드 작업 규칙

- 이 폴더는 독립 Git 저장소다. 수정 전 Git 루트·브랜치·기존 diff를 확인한다.
- `CLAUDE.md`, `README.md`, 해당 코드의 테스트를 읽는다. 로컬에 있는 `dev_rules/`와 `.codex/skills/`는 필요한 작업에만 적용한다.
- Node.js 20, npm, `package-lock.json`을 사용한다. 설치는 `npm ci`, 완료 검증은 `npm run verify`다. 검증은 lint → typecheck → Jest → build 순서이며 실패를 숨기지 않는다.
- 승인된 기획 revision의 범위만 구현하고, 독립 리뷰에는 실제 diff와 검증 결과를 제공한다.
- `.env.local` 등 실제 환경 파일을 추가하거나 출력하지 않는다. 샘플은 `.env.example`에 가짜 값만 둔다. 기존 추적 파일은 `.gitignore`만으로 추적 해제되지 않는다.
- 로컬 Docker는 `docs/local-development.md`를 따른다. 운영 주소나 운영 Compose를 로컬 기본값으로 사용하지 않는다.
- PR 검증은 `verify` 검사다. 배포 workflow는 별도 승인을 받은 사람이 `main`에서 수동 실행하며, push/PR로 배포하지 않는다.
