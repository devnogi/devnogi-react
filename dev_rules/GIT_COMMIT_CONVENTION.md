# Git 커밋 메시지 컨벤션

## 커밋 메시지 구조

```
<type>: <subject>

<body>

<footer>
```

### 1. Type (필수)

커밋의 성격을 나타내는 타입을 명시합니다.

| 타입 | 설명 | 예시 |
|------|------|------|
| `feat` | 새로운 기능 추가 | `feat: 사용자 로그인 기능 추가` |
| `fix` | 버그 수정 | `fix: 로그인 시 에러 처리 개선` |
| `docs` | 문서 수정 | `docs: README 업데이트` |
| `style` | 코드 포맷팅, 세미콜론 누락 등 (기능 변경 없음) | `style: 코드 포맷팅 수정` |
| `refactor` | 코드 리팩토링 (기능 변경 없음) | `refactor: 컴포넌트 구조 개선` |
| `test` | 테스트 코드 추가 또는 수정 | `test: 로그인 컴포넌트 테스트 추가` |
| `chore` | 빌드 프로세스 또는 보조 도구 변경 | `chore: 패키지 의존성 업데이트` |
| `perf` | 성능 개선 | `perf: 이미지 로딩 최적화` |
| `ci` | CI/CD 설정 변경 | `ci: GitHub Actions 워크플로우 추가` |
| `build` | 빌드 시스템 또는 외부 종속성 변경 | `build: webpack 설정 업데이트` |
| `revert` | 이전 커밋 되돌리기 | `revert: feat: 사용자 로그인 기능 추가` |
| `infra` | 인프라 관련 변경 | `infra: Docker 설정 추가` |
| `design` | UI/UX 디자인 변경 | `design: 버튼 스타일 개선` |
| `security` | 보안 관련 변경 | `security: XSS 방지 로직 추가` |

### 2. Subject (필수)

커밋의 간단한 설명을 작성합니다.

#### 규칙
- 50자 이내로 작성
- 첫 글자는 소문자로 시작
- 마침표로 끝내지 않음
- 명령형 현재 시제 사용 (add, fix, update, remove 등)
- 과거형이나 미래형 사용 금지

#### 좋은 예시
```
feat: 사용자 프로필 편집 기능 추가
fix: 로그인 폼 유효성 검사 오류 수정
refactor: 컴포넌트 구조 개선
```

#### 나쁜 예시
```
feat: 사용자 프로필 편집 기능을 추가했습니다
fix: 로그인 폼 유효성 검사 오류를 수정했습니다
refactor: 컴포넌트 구조를 개선했습니다
```

### 3. Body (선택)

커밋의 자세한 설명이 필요한 경우 작성합니다.

#### 규칙
- 72자 이내로 줄바꿈
- 무엇을, 왜 변경했는지 설명
- 어떻게 변경했는지는 코드에서 확인 가능하므로 생략

#### 예시
```
feat: 소셜 로그인 기능 추가

- Google OAuth 2.0 연동 구현
- 사용자 정보 자동 동기화
- 기존 이메일 로그인과 통합

Resolves: #123
```

### 4. Footer (선택)

커밋과 관련된 메타데이터를 포함합니다.

#### 이슈 참조
```
Closes: #123
Fixes: #456
Resolves: #789
```

#### Breaking Changes
```
BREAKING CHANGE: API 응답 형식이 변경되었습니다.

기존: { user: { name: string } }
변경: { user: { firstName: string, lastName: string } }
```

## 커밋 메시지 예시

### 기능 추가
```
feat: 소셜 로그인 기능 추가

- Google OAuth 2.0 연동
- Facebook 로그인 지원
- 사용자 프로필 자동 동기화

Closes: #123
```

### 버그 수정
```
fix: 모달 닫기 버튼 동작 오류 수정

- ESC 키 이벤트 리스너 추가
- 배경 클릭 시 모달 닫기 기능 개선

Fixes: #456
```

### 리팩토링
```
refactor: Button 컴포넌트 구조 개선

- variant prop을 통한 스타일 관리
- size prop 추가로 크기 조절 가능
- 불필요한 중복 코드 제거
```

### 문서 업데이트
```
docs: API 문서 업데이트

- 새로운 엔드포인트 문서 추가
- 응답 예시 코드 개선
- 에러 코드 설명 추가
```

### 테스트 추가
```
test: 로그인 컴포넌트 테스트 추가

- 성공적인 로그인 시나리오 테스트
- 에러 처리 테스트 케이스 추가
- 유효성 검사 테스트 추가
```

### 성능 개선
```
perf: 이미지 로딩 최적화

- Next.js Image 컴포넌트 적용
- WebP 포맷 우선 사용
- 지연 로딩 구현

Improves: #789
```

### 인프라 변경
```
infra: Docker 컨테이너 설정 추가

- 개발 환경 Dockerfile 추가
- docker-compose.yml 설정
- 멀티 스테이지 빌드 최적화
```

## 커밋 메시지 작성 체크리스트

- [ ] 타입이 명확하고 적절한가?
- [ ] 제목이 50자 이내인가?
- [ ] 제목이 명령형 현재 시제로 작성되었는가?
- [ ] 제목이 소문자로 시작하는가?
- [ ] 제목이 마침표로 끝나지 않는가?
- [ ] 본문이 필요한 경우 72자 이내로 줄바꿈되었는가?
- [ ] 이슈 번호가 참조되었는가? (해당하는 경우)
- [ ] Breaking Changes가 명시되었는가? (해당하는 경우)

## 자동화 도구

### Commitizen
```bash
npm install -g commitizen
npm install -g cz-conventional-changelog
```

### Husky + lint-staged
```json
{
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
```

### Commitlint
```bash
npm install -g @commitlint/cli @commitlint/config-conventional
```

---

*이 컨벤션은 [Conventional Commits](https://www.conventionalcommits.org/)를 기반으로 작성되었습니다.* 