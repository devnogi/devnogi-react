# TypeScript, React, Next.js 개발 원칙

## 1. TypeScript 원칙

### T1. 타입 안전성 우선 (Type Safety First)
- 모든 변수, 함수, 컴포넌트에 명시적 타입 정의
- `any` 타입 사용 금지, `unknown` 사용 권장
- 제네릭을 활용한 재사용 가능한 타입 정의

### T2. 인터페이스 분리 (Interface Segregation)
- 큰 인터페이스보다 작고 구체적인 인터페이스 사용
- 컴포넌트 props는 필요한 속성만 포함
- 유니온 타입과 제네릭을 활용한 유연한 타입 설계

### T3. 타입 추론 활용 (Type Inference Leverage)
- TypeScript의 타입 추론 기능 적극 활용
- 불필요한 타입 어노테이션 제거
- `const assertions`와 `as const` 활용

## 2. React 원칙

### R1. 단일 책임 원칙 (Single Responsibility)
- 각 컴포넌트는 하나의 명확한 책임만 가짐
- 컴포넌트 크기는 200줄 이하로 유지
- 복잡한 로직은 커스텀 훅으로 분리

### R2. 불변성 유지 (Immutability)
- 상태 업데이트 시 항상 새로운 객체/배열 생성
- 직접적인 상태 변경 금지
- 스프레드 연산자와 구조 분해 할당 활용

### R3. 순수 함수 컴포넌트 (Pure Function Components)
- 부수 효과 없는 순수 함수로 컴포넌트 작성
- props에만 의존하는 예측 가능한 렌더링
- `React.memo`를 통한 불필요한 리렌더링 방지

### R4. 훅 규칙 준수 (Hook Rules Compliance)
- 훅은 항상 컴포넌트 최상위 레벨에서 호출
- 조건문이나 반복문 내부에서 훅 사용 금지
- 커스텀 훅은 `use` 접두사로 명명

## 3. Next.js 원칙

### N1. 파일 기반 라우팅 (File-based Routing)
- 페이지와 레이아웃은 적절한 디렉토리 구조로 구성
- 동적 라우팅은 `[param]` 폴더 사용
- API 라우트는 `app/api` 디렉토리 내에 배치

### N2. 서버 컴포넌트 우선 (Server Components First)
- 기본적으로 서버 컴포넌트 사용
- 클라이언트 컴포넌트는 필요한 경우에만 `'use client'` 지시어 사용
- 데이터 페칭은 서버 컴포넌트에서 처리

### N3. 메타데이터 관리 (Metadata Management)
- 각 페이지에 적절한 메타데이터 설정
- 동적 메타데이터는 `generateMetadata` 함수 사용
- SEO 최적화를 위한 구조화된 데이터 포함

## 4. 상태 관리 원칙

### S1. 로컬 상태 우선 (Local State First)
- 컴포넌트 내부 상태로 해결 가능한 경우 전역 상태 사용 금지
- props drilling이 3단계 이상인 경우에만 전역 상태 고려
- Context API는 적절한 범위로 제한

### S2. 상태 정규화 (State Normalization)
- 중첩된 객체 구조 대신 평면화된 상태 구조 사용
- ID 기반 참조로 데이터 관계 관리
- 중복 데이터 제거

## 5. 성능 최적화 원칙

### P1. 코드 분할 (Code Splitting)
- 라우트 기반 코드 분할 자동 활용
- 큰 컴포넌트는 동적 임포트로 분할
- 번들 크기 모니터링

### P2. 메모이제이션 전략 (Memoization Strategy)
- `useMemo`와 `useCallback`의 적절한 사용
- 의존성 배열 최소화
- 불필요한 메모이제이션 방지

### P3. 이미지 최적화 (Image Optimization)
- Next.js Image 컴포넌트 사용
- 적절한 이미지 포맷과 크기 선택
- 지연 로딩 적용

## 6. 에러 처리 원칙

### E1. 타입 안전한 에러 처리 (Type-safe Error Handling)
- 에러 타입을 명시적으로 정의
- 에러 바운더리 컴포넌트 활용
- 사용자 친화적인 에러 메시지 제공

### E2. 폼 검증 (Form Validation)
- 클라이언트와 서버 양쪽에서 검증
- 실시간 피드백 제공
- 접근성을 고려한 에러 표시

## 7. 테스팅 원칙

### T1. 컴포넌트 테스트 (Component Testing)
- 각 컴포넌트의 주요 기능 테스트
- 사용자 상호작용 시나리오 테스트
- 접근성 테스트 포함

### T2. 통합 테스트 (Integration Testing)
- 페이지 레벨 통합 테스트
- API 라우트 테스트
- 데이터 플로우 테스트

## 8. 접근성 원칙

### A1. 시맨틱 HTML (Semantic HTML)
- 적절한 HTML 태그 사용
- ARIA 속성 활용
- 키보드 네비게이션 지원

### A2. 색상 대비 (Color Contrast)
- WCAG 2.1 AA 기준 준수
- 색상만으로 정보 전달 금지
- 고대비 모드 지원

## 9. 보안 원칙

### S1. 입력 검증 (Input Validation)
- 모든 사용자 입력 검증
- XSS 공격 방지
- CSRF 토큰 사용

### S2. 환경 변수 관리 (Environment Variables)
- 민감한 정보는 환경 변수로 관리
- 클라이언트 사이드 노출 금지
- 적절한 환경별 설정 분리

## 10. 코드 품질 원칙

### C1. 일관된 코딩 스타일 (Consistent Coding Style)
- ESLint와 Prettier 규칙 준수
- 일관된 네이밍 컨벤션
- 주석과 문서화

### C2. 리팩토링 지속 (Continuous Refactoring)
- 코드 냄새 조기 발견 및 수정
- 기술 부채 최소화
- 정기적인 코드 리뷰

---

## 적용 가이드

이 원칙들은 프로젝트의 모든 개발 과정에서 준수되어야 합니다:

1. **새 기능 개발 시**: 관련 원칙들을 먼저 검토
2. **코드 리뷰 시**: 원칙 준수 여부 확인
3. **리팩토링 시**: 원칙에 맞지 않는 코드 개선
4. **아키텍처 결정 시**: 원칙을 기준으로 판단

## 예외 상황

원칙을 위반해야 하는 경우:
- 명확한 이유와 근거 필요
- 팀원들과의 합의 필수
- 문서화 및 후속 개선 계획 수립

---

*이 문서는 프로젝트의 개발 품질과 일관성을 유지하기 위한 가이드라인입니다.* 