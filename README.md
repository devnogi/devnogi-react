# DevNogi Front

Next.js로 구현된 MSA 아키텍처의 프론트엔드 프로젝트입니다. BFF(Backend for Frontend) 패턴을 적용하여 클라이언트와 마이크로서비스 간의 효율적인 통신을 구현합니다.

## 기술 스택

- **런타임**: Node.js v22
- **프레임워크**: [Next.js](https://nextjs.org) v15.3.3 (App Router)
- **언어**: TypeScript v5
- **스타일링**: 
  - Tailwind CSS v4
  - Shadcn/UI

## 프로젝트 구조

```
devnogi-front/
├── src/                 # 소스 코드
│   ├── app/             # Next.js App Router 구조
│   └── lib/             # 유틸리티 함수
└── public/              # 정적 파일
```

## 개발 환경 설정

1. 저장소 클론
```bash
git clone [your-repository-url]
cd devnogi-front
```

2. 의존성 설치
```bash
npm install
```

3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인할 수 있습니다.

## 개발 프로세스

### GitHub Flow 브랜치 전략

이 프로젝트는 실제 배포 전까지는 단순하고 지속적인 배포를 지향하는 GitHub Flow를 따릅니다:

- `main`: 항상 배포 가능한 상태를 유지하는 기본 브랜치

### 브랜치 작업 플로우

1. 새로운 작업 시작
```bash
git switch main
git pull origin main
git switch -c 브랜치명
# 개발 작업 수행
git add .
git commit -m "작업 설명"
git push origin 브랜치명
# PR 생성: 브랜치명 -> main
```

2. PR(Pull Request) 프로세스
   - PR 생성 시 작업 내용 상세히 설명
   - 코드 리뷰 진행
   - 승인 후 main 브랜치에 머지

### 커밋 메시지 컨벤션

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드
- `chore`: 기타 간단한 수정 등

예시: `feat: 로그인 페이지 구현`

## 품질 관리

이 프로젝트는 다음과 같은 품질 관리 도구를 사용합니다:

- **ESLint**: 코드 품질 검사
- **Prettier**: 코드 스타일 포맷팅
- **Jest**: 단위 테스트
- **Husky**: Git 훅을 통한 자동화된 품질 관리

커밋 시 자동으로 다음 작업이 수행됩니다:
- 코드 포맷팅
- 린트 검사
- 테스트 실행

## 빌드 및 배포

### 빌드
```bash
npm run build
```
