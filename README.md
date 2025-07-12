# DevNogi Front

Next.js로 구현된 MSA 아키텍처의 프론트엔드 프로젝트입니다. BFF(Backend for Frontend) 패턴을 적용하여 클라이언트와 마이크로서비스 간의 효율적인 통신을 구현합니다.

## 기술 스택

- **런타임**: Node.js v22
- **프레임워크**: [Next.js](https://nextjs.org) v15.3.3 (App Router)
- **언어**: TypeScript v5
- **스타일링**: 
  - Tailwind CSS v4
  - Shadcn/UI
- **백엔드서버모킹**: json-server

## 프로젝트 구조

```
devnogi-front/
├── src/           # 소스 코드
│   ├── app/         # Next.js App Router 구조
│   ├── components/  # 컴포넌트
│   │   ├── page/      # 각 페이지별 컴포넌트
│   │   └── ui/        # 쉐이든 ui 컴포넌트
│   ├── data/        # 데이터/목업
│   ├── lib/         # 외부 연동, 설정 서비스
│   └── utils/       # 공통 유틸리티 함수
└── public/        # 정적 파일
```

## 개발 환경 설정

0. 원본 저장소에서 프로젝트 포크  
[원본 저장소 링크](https://github.com/devnogi/devnogi-react)

1. 저장소 클론
```bash
git clone [your-repository-url]
cd devnogi-front
```

2. 의존성 설치
```bash
npm install
```

3. 환경파일 생성
```plaintext
.sample_env를 참조해 루트 디렉토리에 .env 파일 생성
```

4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인할 수 있습니다.

### Gateway 모킹 서버

[json-server](https://github.com/typicode/json-server#readme)를 사용해 Gateway를 모킹할 수 있습니다.

1. 서버 파일 생성
```plaintext
루트 디렉토리에 api 구조에 맞게 db.json 파일 생성
```

2. 
``` bash
npx json-server --watch db.json --port 3001
```

[http://localhost:3001](http://localhost:3001)로 모킹 서버에 접근할 수 있습니다.

## 개발 프로세스

### GitHub Flow 브랜치 전략

이 프로젝트는 실제 배포 전까지는 단순하고 지속적인 배포를 지향하는 GitHub Flow를 따릅니다:

- `main`: 항상 배포 가능한 상태를 유지하는 기본 브랜치

### 브랜치 작업 플로우

0. 작업 전 원본 저장소와 싱크 확인

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

3. 머지 완료 후 포크 저장소 최신화

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
