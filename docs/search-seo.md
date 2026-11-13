# Search SEO v1

공개 커뮤니티/의장 목록과 영구 아이템 페이지를 서버에서 렌더링한다. 검색 순위나 색인 시점을 보장하지 않으며 Search Console 연동은 포함하지 않는다.

## 공개 URL과 데이터

- `/community`: 최신 공개 글 20개. `?page=N`은 1부터 시작하며 다음/이전 링크와 각 페이지의 canonical을 제공한다.
- `/outfits`: 최신 의장 24개. 기존 `?cursor=...`를 다음 페이지 링크에 사용한다. 검색/인기/복합 필터 URL은 noindex,follow다.
- `/items/[itemKey]`: UTF-8 JSON `[topCategory,subCategory,name]`의 unpadded base64url이다. 카탈로그에서 반환한 식별자를 canonical로 사용하고 동등한 다른 인코딩은 308로 보낸다. 잘못된 식별자/없는 아이템은 404다.
- 아이템은 카탈로그 설명 또는 보존된 일간/주간 통계가 있으면 색인 대상이다. 최근 표시 구간이 비어도 자격을 잃지 않고 마지막 보존 집계를 표시한다.
- 일간 30일·주간 120일 통계를 사용한다. 판매 수량과 거래 금액을 구분하며 평균은 거래 금액/판매 수량이다. 두 기간 표는 초기 HTML에 포함된다.

공개 서버 fetch는 사용자 쿠키와 인증 헤더를 전달하지 않는다. 개인 반응은 클라이언트에서 별도로 읽으며 인증/개인 상태 확인 전 좋아요·즐겨찾기 변경을 막는다. 의장 초기 데이터에는 저장소 서명 URL 대신 `/api/outfits/{id}/images/{imageId}`만 직렬화한다.

## Provider 의존성

Gateway의 기존 prefix를 사용한다. React보다 아래 provider가 먼저 배포되어야 한다.

- Community: `/dcs/api/posts/sitemap`, `/dcs/api/outfits/sitemap`. 공개 ID와 실제 수정일만 반환하는 ID keyset projection.
- Batch: `/oab/api/item-infos/seo`, `/oab/api/item-infos/sitemap`. 영구 아이템의 공통 색인 자격과 마지막 보존 통계, 카탈로그 복합 keyset projection.
- 각각의 서비스 `docs/search-seo.md`, `docs/item-seo.md`와 `contracts/`의 JSON fixture가 응답 계약이다.

## Sitemap와 상태 코드

`/sitemap.xml`은 `/sitemap-static.xml`, `/sitemap-posts.xml`, `/sitemap-outfits.xml`, `/sitemap-items.xml`의 index다. index는 1,000개씩 경량 projection을 순회해 시작 커서를 찾는다. 자식은 자기 커서만 직접 조회한다. 성공 XML만 프로세스 메모리에 최대 300초 보관하며 만료 뒤 장애는 503이다. 일부 결과를 성공 응답으로 반환하지 않는다. 카탈로그에는 수정 시각이 없어 lastmod를 만들지 않는다.

글/의장/아이템 상세는 metadata 단계에서 존재 여부를 확인한다. 전체 main-layout Suspense를 제거하고 metadata streaming을 비활성화해 없는 문서를 HTTP 404, 필수 API 장애를 5xx로 반환한다. 경매장 첫 화면도 force-dynamic SSR을 사용한다. 이 선택은 정확한 상태 코드를 위해 초기 응답을 필수 metadata 조회 완료까지 기다리게 한다.

robots는 기존 API 차단을 유지하면서 공개 의장 이미지 경로만 허용한다. 삭제된 이미지의 404 정책은 유지한다.

## 검증과 배포

`npm run verify`가 format, lint, typecheck, deadcode, Jest, production build를 실행한다. metadata 함수 mock만으로 HTTP 상태를 증명할 수 없으므로 production `next start`에서 200/404/308/5xx, JS-off 본문/표/페이지 링크, XML 오류, 익명/로그인 상호작용을 추가 확인한다.

배포 순서: 사람의 병합 승인 → Community와 Batch provider 배포/공개 GET 확인 → React 배포 → 운영 읽기 전용 점검. 통계의 300초 캐시, sitemap의 300초 프로세스 캐시, 필수 API 장애 시 5xx를 관찰한다. sitemap index 생성 비용은 전체 공개 카탈로그 수에 따라 증가하며 합성 EXPLAIN은 운영 지연의 보장이 아니다.
