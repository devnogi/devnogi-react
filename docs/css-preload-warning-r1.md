# 다른 페이지 CSS 프리패치 경고 수정 r1

- 기준: `main`의 `9ebe63f`, 브랜치 `fix/css-preload-warning`, 버전 `1.0.30`.
- `/hero-auctions`에서 사용하지 않은 CSS preload 경고의 두 파일은 길드 레이아웃의 `guild.css` (`2345695d322d7922.css`)와 로그인 페이지의 `AuthPanel.module.css` (`675c1bd902d00ab7.css`)다. 로컬 빌드 manifest 및 CSS 내용으로 소유 페이지를 확인했다. 해시는 진단 당시 빌드 기준이다.
- 운영 Chromium 요청 추적에서 `/guilds?_rsc`, `/sign-in?_rsc`의 `next-router-prefetch: 1`을 확인했다. 두 RSC 요청만 임시 제외한 대조 실험에서 CSS preload가 0개였고 실험 설정은 원복했다. 인증 확인 중 상단 로그인 링크가 먼저 렌더링되는 경우도 동일한 경로를 사용한다.
- 승인된 수정은 상단 길드 링크, 상단 로그인 링크, 경매 비로그인 안내 로그인 링크 세 곳에만 `prefetch={false}`를 적용한다. 공통 NavigationItem은 선택 prop을 전달하며 기본값은 기존 Next 동작을 유지한다. CSS 파일·import·다른 링크·패키지는 변경하지 않는다.
- [Next.js 15 공식 프리패치 문서](https://nextjs.org/docs/15/app/guides/prefetching)에 따라 특정 링크 프리패치를 비활성화한다. 해당 목적 페이지의 미리 다운로드 이점은 포기하고 클릭할 때 필요한 리소스를 로드한다. 클라이언트 이동과 목적 페이지 스타일은 유지한다.
- 완료 기준: 세 링크의 prefetch prop과 나머지 메뉴 기본값 회귀, 로그인 안내·메뉴 기존 테스트, Node 20 전체 `npm run verify`, workflow 계약 테스트 2종, 실제 Chromium에서 경고 제거 및 길드·로그인 클릭 후 스타일 확인. 커밋·PR·운영 병합은 담당 리더의 별도 단계다.

## 구현 검증

- Node 20.20.2 대상 테스트 2 suites / 30 tests 통과, workflow 계약 테스트 9개 통과.
- `npm run verify` 종료 코드 0: 포맷·lint·typecheck·deadcode·112 suites / 540 tests·프로덕션 빌드 49개 정적 페이지 모두 통과. 범위 밖 기존 lint 경고는 유지했다.
- `git diff --check` 통과. 실제 Chromium에서 변경 이후 경고 및 목적 페이지 스타일 확인은 검증 담당 리더에게 인계한다.

## Chromium 검증

- 로컬 프로덕션 빌드 + 실제 로컬 Auth/MySQL, 응답 모킹 없이 검증했다.
- 비로그인 데스크톱, 로그인 데스크톱 및 모바일(390×844) 경매 화면에서 로드 후 9초 대기: CSS preload 0개, console warning 0건.
- 모바일 경매 규칙 팝업 표시 및 가로 넘침 없음 확인.
- 길드 메뉴 클릭 후 guild.css가 stylesheet로 로드되고 제목의 32px / 750 스타일 적용 확인.
- 로그인 안내 클릭 후 AuthPanel.module.css 로드 및 library 배경 이미지 적용 확인.
- 로컬 Community 서비스는 연결하지 않아 길드 데이터 API 3개는 404였다. 길드 데이터 기능은 이번 검증 범위 밖이며 CSS 적용 검증과 구분한다. 익명 인증 확인 401은 예상 응답이다.
- 독립 검토 결과 ACCEPT / CLEAR. 운영에는 아직 반영하지 않았다.
