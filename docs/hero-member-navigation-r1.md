# 광고 경매 회원 접근·모바일 메뉴·규칙 팝업 r1

- 기준: `main`의 `4d5c343`, 작업 브랜치 `fix/hero-member-navigation`.
- 대상은 React다. 광고 경매·XP 백엔드 정책과 메인 Hero 공개 조회는 변경하지 않는다.
- 인증 확인 완료 후 로그인한 사용자에게만 상단 광고 경매 메뉴를 표시한다. 직접 `/hero-auctions`에 접근한 비로그인 사용자에게 로그인 안내와 진입 링크를 제공한다. 인증 로딩 및 비로그인 상태에서는 경매 내용과 경매 조회 훅을 마운트하지 않는다.
- 모바일 두 번째 메뉴 열은 기본 터치 가로 스크롤을 허용한다. 데스크톱 배열을 유지하고 기존 Radix Popover portal을 사용해 경매장·도감 메뉴가 스크롤 영역에 잘리지 않도록 한다. 바깥 클릭·Escape 닫기·트리거 포커스 복귀를 유지한다.
- 인라인 경매 규칙을 기존 Dialog 기반 팝업으로 이동한다. 기존 규칙 문구를 보존하고 제목·설명·닫기·Escape·포커스 복귀를 제공한다. 작은 화면에서 팝업 최대 높이를 제한하고 내용 영역을 스크롤할 수 있게 한다.
- 완료 검증: 로그인·비로그인·인증 로딩의 메뉴와 직접 접근/조회, 로그아웃 후 내용 제거, Portal 메뉴와 키보드 닫기, 규칙 팝업 내용·Escape·포커스 회귀 테스트. 실제 모바일 브라우저에서 가로 스크롤 후 도감 메뉴 선택을 확인한다.
- Node 20 `npm run verify`, workflow 계약 테스트 2종을 실행한다. 버전은 `1.0.29`이며 package lock과 workflow 기대값을 함께 갱신한다. 구현·독립 리뷰·PR 이후 운영 병합과 배포는 별도 단계다.

## 구현 검증

- Node 20.20.2 `npm run verify` 통과: 포맷·포맷 스크립트 회귀·lint·typecheck·deadcode·112개 suite의 539개 테스트·프로덕션 빌드 완료. 기존 변경 범위 밖의 lint 경고는 유지한다.
- `node --test scripts/workflow-contract.test.mjs scripts/test-production-workflow.mjs`: 9개 테스트 통과.
- `git diff --check` 통과. 실제 Chromium 모바일 스크롤·메뉴 선택·Dialog 검증과 독립 리뷰는 별도 검증 담당자에게 인계한다.
