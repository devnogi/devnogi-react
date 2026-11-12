# Hero 관리·XP 광고 경매

API 제공자는 Auth이며 BFF는 `/api/hero`, `/api/user/hero`, `/api/admin/hero`를 Gateway의 `/das`로 전달한다. 세부 API 계약은 Auth의 `docs/hero-api.md`를 따른다.

- `/admin/hero`: 기본 이미지 1~10개 등록·수정·soft delete·순서 변경, 한국 시간 노출 일정, 시간별 최종 노출 미리보기, 사용자 소재 차단, 주차 전체 취소·환불.
- `/hero-auctions`: 소재 등록·선택, 1·2번 개별 입찰, 예약 XP와 참여·거래 이력. 경매 규칙은 화면에서 확인할 수 있다.
- 마이페이지 XP는 `currentXp`를 표시하며 활동 합계 `totalXp`는 기존 API 의미를 유지한다. Auth 우선 배포 중에는 아직 새 필드가 없는 응답만 기존 XP를 표시한다.
- 경매와 지갑은 30초마다 갱신하며 서버 시각으로 마감을 판정한다. 확정은 서버에서 수행한다. 동일 요청의 재시도에는 같은 입찰 멱등성 키를 사용한다.
- Hero는 30초·일정 경계·탭 복귀 시 갱신한다. 종료된 광고는 조회 실패 중에도 제거한다. 공개 조회는 인증 쿠키를 전달하지 않는다.
- 관리 및 사용자 변경 요청은 `X-Hero-Action: 1`과 동일 출처 Origin이 필요하다. 인증은 Auth의 access-token 쿠키를 사용한다.
- 업로드는 JPEG/PNG, 10 MiB, 2,400만 화소 제한이다. 링크 허용 사례는 `hero-link-fixtures.json`을 Auth와 동일하게 유지한다.

검증: `npm run verify`. 주요 회귀 검증은 Hero 캐러셀·일정 만료, URL 우회, BFF 쿠키/CSRF 경계, 관리자 최소 이미지 보호, 입찰 자격·소재 선택, 외부 상위 입찰 후 XP 예약 해제 표시다.

운영에서는 Auth 스키마와 API를 먼저 배포한 후 프런트를 배포한다. 경매 응답의 `enabled`는 현재 입찰 가능 여부이며, 활성화 설정 후 미래 시작일을 기다리면 `scheduledStartAt`에 UTC 시작 시각이 제공된다. 사용자와 관리자 화면은 이를 한국 시간의 날짜·요일·24시간 시각으로 표시한다. 비활성화 상태 또는 이미 시작된 경매에서는 `scheduledStartAt`이 `null`이다. 이전 API에서 필드가 생략되어도 동작하며, `enabled=false`이고 예정 시각이 없으면 비활성화 안내를 표시한다. PR 병합과 운영 설정 변경은 별도 승인 절차를 따른다.

## 시작 예정 안내 수정 v1 — 2026-11-12

- 대상: React 사용자 `/hero-auctions`, 관리자 `/admin/hero`, 경매 응답 타입 및 날짜 표현·화면 회귀 테스트.
- 완료 기준: `2026-11-15T15:00:00Z`를 `2026년 11월 16일 월요일 00:00 (한국 시간)` 시작 예정으로 표시한다. 예약 시작과 비활성화를 구분하고, 예정 상태에서는 기존 `enabled=false` 입찰 차단을 유지한다.
- 호환성: `scheduledStartAt`은 선택 필드다. `null`·필드 없음·개장 상태를 테스트하며 입찰·정산 정책은 변경하지 않는다.
- 버전: `1.0.28`. 두 workflow 계약 테스트의 기대 버전과 package lock을 함께 갱신한다.
- 검증: Node 20에서 `npm run verify` 및 `node --test scripts/workflow-contract.test.mjs scripts/test-production-workflow.mjs`. 실제 Chromium에서 양쪽 화면의 예정·비활성 상태를 별도로 확인한다.
- 로컬 production 실행: 검증 빌드가 완료된 작업 폴더에서 로컬 Gateway URL을 지정하고 `npm run start -- -H 127.0.0.1 -p 3327`을 실행한다. 개발 서버와 빌드를 같은 `.next`에서 동시에 실행하지 않는다. 실제 운영 연결이나 운영 설정 변경은 이 수정 범위에 포함하지 않는다.
