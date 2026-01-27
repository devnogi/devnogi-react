# 경매장 옵션 검색 플로팅바 - 테스트 가이드

> **작성일**: 2025-10-28
> **개발 서버**: http://localhost:3000
> **테스트 페이지**: http://localhost:3000/auction-history

---

## 사전 준비

### 1. 개발 서버 실행

```bash
cd devnogi-react
npm run dev
```

서버가 시작되면 http://localhost:3000 에서 접속 가능합니다.

### 2. 환경 변수 확인

`.env` 파일이 존재하고 다음 변수가 설정되어 있는지 확인:

```env
GATEWAY_URL=http://168.107.43.221:8080
NODE_ENV=development
API_MOCKING=disabled
```

---

## 테스트 시나리오

### 시나리오 1: 플로팅바 UI 확인 ✅

**목적**: 오른쪽에 플로팅바가 정상적으로 표시되는지 확인

**절차**:
1. 브라우저에서 http://localhost:3000/auction-history 접속
2. 화면 오른쪽에 "검색 필터" 플로팅바 확인
3. 기본 필터(금액, 거래 일자)가 표시되는지 확인
4. "필터 추가" 버튼이 있는지 확인

**예상 결과**:
- ✅ 오른쪽에 흰색 배경의 카드 스타일 플로팅바가 표시됨
- ✅ "💰 금액 (골드)" 필터 카드
- ✅ "📅 거래 일자" 필터 카드
- ✅ "필터 추가" 버튼 (+ 아이콘)
- ✅ "초기화", "검색 적용" 버튼

---

### 시나리오 2: 동적 필터 추가 ✅

**목적**: 검색 옵션 메타데이터를 불러와 필터를 동적으로 추가할 수 있는지 확인

**절차**:
1. "필터 추가" 버튼 클릭
2. 드롭다운 목록이 표시되는지 확인
3. 목록에서 "밸런스" 선택
4. 새로운 필터 카드가 추가되는지 확인
5. 입력 필드 확인:
   - 숫자 입력 필드 (값)
   - 드롭다운 (UP/DOWN)

**예상 결과**:
- ✅ 16개의 검색 옵션이 드롭다운에 표시됨
- ✅ "밸런스" 선택 시 새로운 카드 추가
- ✅ 필터명: "밸런스"
- ✅ X 버튼 (우측 상단)
- ✅ 숫자 입력 필드 + "UP/DOWN" 드롭다운

**검증 포인트**:
- 브라우저 콘솔에서 네트워크 탭 확인
- `/api/search-option` 요청이 성공했는지 확인 (200 OK)
- 응답 데이터에 16개의 검색 옵션이 포함되어 있는지 확인

---

### 시나리오 3: Range 필터 테스트 ✅

**목적**: From/To 형태의 범위 필터가 정상 작동하는지 확인

**절차**:
1. "필터 추가" 버튼 클릭
2. "에르그" 선택
3. 입력 필드 확인:
   - "최소" 입력 필드
   - "최대" 입력 필드
   - 중간에 "~" 표시
4. 최소: 20, 최대: 50 입력

**예상 결과**:
- ✅ 두 개의 숫자 입력 필드 표시
- ✅ 중간에 "~" 구분자
- ✅ 입력 값이 정상적으로 반영됨

**다른 Range 필터**:
- 에르그 (`ErgFrom` ~ `ErgTo`)
- 최대 공격력 (`MaxAttackFrom` ~ `MaxAttackTo`)
- 최대 부상률 (`MaxInjuryRateFrom` ~ `MaxInjuryRateTo`)

---

### 시나리오 4: Enum 필터 테스트 ✅

**목적**: 드롭다운 선택 형태의 필터가 정상 작동하는지 확인

**절차**:
1. "필터 추가" 버튼 클릭
2. "에르그 등급" 선택
3. 드롭다운에서 "S등급" 선택

**예상 결과**:
- ✅ 단일 드롭다운 표시
- ✅ 옵션: S등급, A등급, B등급
- ✅ 선택된 값이 표시됨

---

### 시나리오 5: 필터 제거 ✅

**목적**: 추가한 필터를 제거할 수 있는지 확인

**절차**:
1. "밸런스" 필터 추가
2. 우측 상단 X 버튼 클릭
3. 필터 카드가 사라지는지 확인
4. "필터 추가" 드롭다운을 다시 열어 "밸런스"가 다시 나타나는지 확인

**예상 결과**:
- ✅ X 버튼 클릭 시 필터 카드 제거
- ✅ 제거된 필터가 드롭다운에 다시 표시됨

---

### 시나리오 6: 초기화 기능 ✅

**목적**: 모든 필터를 한 번에 초기화할 수 있는지 확인

**절차**:
1. 기본 필터에 값 입력:
   - 금액 최소: 100000
   - 금액 최대: 500000
   - 거래 일자 시작: 2025-01-01
2. 동적 필터 추가 및 입력:
   - 밸런스: 50, UP
   - 크리티컬: 30, UP
3. "초기화" 버튼 클릭
4. 모든 필드가 비워지는지 확인

**예상 결과**:
- ✅ 기본 필터의 모든 입력값 초기화
- ✅ 동적 필터 카드가 모두 제거됨
- ✅ 검색 결과는 변경되지 않음 (사용자가 "검색 적용" 버튼을 눌러야 함)

---

### 시나리오 7: 검색 적용 (통합 테스트) ✅

**목적**: 필터를 적용했을 때 실제 API 호출이 올바르게 되는지 확인

**절차**:
1. 기본 검색 조건 입력:
   - 아이템명: "던바튼"
2. 기본 필터 입력:
   - 금액 최소: 1000000
   - 금액 최대: 5000000
3. 동적 필터 추가:
   - 밸런스: 50, UP 선택
4. "검색 적용" 버튼 클릭
5. 브라우저 개발자 도구 → 네트워크 탭 확인
6. `/api/auction-history/search?...` 요청의 쿼리 파라미터 확인

**예상 쿼리 파라미터**:
```
itemName=던바튼
priceMin=1000000
priceMax=5000000
Balance=50
BalanceStandard=UP
page=1
size=20
```

**예상 결과**:
- ✅ API 요청이 성공 (200 OK)
- ✅ 쿼리 파라미터에 모든 필터 값이 포함됨
- ✅ 페이지가 1로 리셋됨
- ✅ 검색 결과가 화면에 표시됨

---

### 시나리오 8: 복잡한 필터 조합 ✅

**목적**: 여러 필터를 동시에 적용했을 때 정상 작동하는지 확인

**절차**:
1. 기본 검색:
   - 카테고리: 무기 → 한손검
   - 아이템명: "브로드소드"
2. 기본 필터:
   - 금액: 500000 ~ 2000000
   - 거래 일자: 2025-01-01 ~ 2025-01-31
3. 동적 필터 추가:
   - 밸런스: 50, UP
   - 크리티컬: 30, UP
   - 에르그: 20 ~ 50
   - 최대 공격력: 100 ~ 200
4. "검색 적용" 버튼 클릭

**예상 쿼리 파라미터**:
```
itemTopCategory=무기
itemSubCategory=한손검
itemName=브로드소드
priceMin=500000
priceMax=2000000
dateFrom=2025-01-01
dateTo=2025-01-31
Balance=50
BalanceStandard=UP
Critical=30
CriticalStandard=UP
ErgFrom=20
ErgTo=50
MaxAttackFrom=100
MaxAttackTo=200
page=1
size=20
```

**예상 결과**:
- ✅ 모든 필터 파라미터가 API 요청에 포함됨
- ✅ 검색 결과가 모든 조건을 만족하는 아이템만 표시됨

---

### 시나리오 9: 반응형 테스트 ✅

**목적**: 화면 크기에 따라 플로팅바가 적절히 숨겨지는지 확인

**절차**:
1. 브라우저 창을 넓게 유지 (1280px 이상)
2. 플로팅바가 표시되는지 확인
3. 브라우저 창을 좁게 조절 (1024px 이하)
4. 플로팅바가 사라지는지 확인
5. 다시 넓게 조절
6. 플로팅바가 다시 나타나는지 확인

**예상 결과**:
- ✅ lg 이상 (1024px+): 플로팅바 표시
- ✅ lg 미만 (1024px-): 플로팅바 숨김
- ✅ 숨김/표시 전환이 부드러움

---

### 시나리오 10: 페이지네이션 리셋 테스트 ✅

**목적**: 필터 변경 시 페이지가 1로 리셋되는지 확인

**절차**:
1. 기본 검색 수행 (아이템명: "던바튼")
2. 검색 결과에서 "다음" 버튼 클릭하여 2페이지로 이동
3. 현재 페이지 확인 (2 / N 페이지)
4. 필터 추가 또는 변경 (예: 금액 최소 1000000)
5. "검색 적용" 버튼 클릭
6. 페이지가 1로 리셋되는지 확인

**예상 결과**:
- ✅ 필터 적용 전: 2페이지
- ✅ 필터 적용 후: 1페이지로 리셋
- ✅ 새로운 검색 결과가 1페이지부터 표시됨

---

## 코드 레벨 검증

### 타입 안전성 확인 ✅

**파일**: `src/hooks/useAuctionHistory.ts`

**확인 사항**:
- [x] `AuctionHistorySearchParams` 인터페이스에 index signature 존재
- [x] 동적 필터 파라미터 처리 로직 구현 (line 69-88)
- [x] 표준 파라미터와 동적 파라미터 분리

**코드 스니펫**:
```typescript
export interface AuctionHistorySearchParams {
  itemName?: string;
  itemTopCategory?: string;
  itemSubCategory?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
  // Dynamic filter fields - these will be added by SearchFilterCard
  [key: string]: string | number | undefined;
}
```

---

### 필터 타입 분석 로직 확인 ✅

**파일**: `src/components/page/auction-history/SearchFilterCard.tsx`

**확인 사항**:
- [x] `analyzeFilterType` 함수가 올바르게 필터 유형 분류
- [x] Range 필터: From/To 패턴 감지
- [x] Value + Standard: Standard 접미사 감지
- [x] Enum: allowedValues 존재 여부 확인
- [x] 기본: Text 입력

**코드 스니펫**:
```typescript
const analyzeFilterType = (searchCondition: Record<string, FieldMetadata>) => {
  const fieldNames = Object.keys(searchCondition);

  // Check for range filter (From/To)
  const hasFromTo = fieldNames.some(
    (name) =>
      name.endsWith("From") &&
      fieldNames.includes(name.replace("From", "To")),
  );
  if (hasFromTo) return "range";

  // Check for value + standard
  const hasStandard = fieldNames.some((name) => name.endsWith("Standard"));
  if (hasStandard) return "valueWithStandard";

  // Check for enum
  const hasEnum = Object.values(searchCondition).some(
    (metadata) => metadata.allowedValues && metadata.allowedValues.length > 0,
  );
  if (hasEnum) return "enum";

  return "text";
};
```

---

### 페이지 통합 확인 ✅

**파일**: `src/app/(main)/auction-history/page.tsx`

**확인 사항**:
- [x] SearchFilterCard import
- [x] handleFilterApply 함수 구현
- [x] searchParams 병합 로직
- [x] currentPage 리셋 로직
- [x] JSX에 SearchFilterCard 렌더링
- [x] 반응형 클래스 적용

**코드 스니펫**:
```typescript
const handleFilterApply = (filters: Record<string, string | number>) => {
  // Merge existing search params with new filters
  const params: AuctionHistorySearchParams = {
    ...searchParams,
    ...filters,
  };

  setSearchParams(params);
  setCurrentPage(1); // Reset to first page when filters change
};
```

```tsx
{/* Fixed Floating Filter Card - Right Side */}
<div className="hidden lg:block">
  <SearchFilterCard onFilterApply={handleFilterApply} />
</div>
```

---

## 브라우저 개발자 도구 활용

### 네트워크 탭 체크리스트

**검증 항목**:
1. [ ] `/api/search-option` 요청 성공 (200 OK)
2. [ ] 응답 데이터에 16개 검색 옵션 포함
3. [ ] `/api/auction-history/search?...` 요청 성공 (200 OK)
4. [ ] 쿼리 파라미터에 모든 필터 값 포함
5. [ ] 파라미터 값 형식 올바름 (숫자는 숫자, 문자는 문자)

### 콘솔 탭 체크리스트

**검증 항목**:
1. [ ] JavaScript 에러 없음
2. [ ] React 경고 없음
3. [ ] API 호출 에러 없음
4. [ ] 타입 에러 없음

---

## 예상 이슈 및 해결 방법

### 이슈 1: 플로팅바가 보이지 않음

**원인**:
- 반응형 클래스 (`hidden lg:block`)로 인해 화면이 작을 때 숨겨짐
- z-index 문제로 다른 요소에 가려짐

**해결**:
- 브라우저 창을 1024px 이상으로 확대
- SearchFilterCard의 z-index 확인

---

### 이슈 2: API 요청 실패

**원인**:
- Gateway 서버가 다운되었을 수 있음
- 환경 변수 설정 오류

**해결**:
- `.env` 파일의 `GATEWAY_URL` 확인
- curl 명령으로 Gateway 서버 상태 확인:
  ```bash
  curl http://168.107.43.221:8080/oab/api/search-option
  ```

---

### 이슈 3: 검색 결과가 필터를 반영하지 않음

**원인**:
- 백엔드 API가 해당 필터 파라미터를 지원하지 않을 수 있음
- 파라미터 이름이 잘못되었을 수 있음

**해결**:
- 네트워크 탭에서 실제 전송된 쿼리 파라미터 확인
- Swagger 문서 확인: http://138.2.126.248:8080/swagger-ui/index.html
- 백엔드 팀에 필터 파라미터 지원 여부 확인

---

### 이슈 4: 필터 추가 드롭다운이 비어있음

**원인**:
- `/api/search-option` API 호출 실패
- 데이터 파싱 오류

**해결**:
- 네트워크 탭에서 API 응답 확인
- 브라우저 콘솔에서 에러 메시지 확인
- `useSearchOptions` 훅의 에러 상태 확인

---

## 성능 체크리스트

### API 캐싱

- [x] `/api/search-option`: 30분 캐싱 (staleTime: 30분)
- [x] `/api/auction-history/search`: 5분 캐싱 (staleTime: 5분)

### 렌더링 최적화

- [x] 불필요한 리렌더링 없음
- [x] 필터 입력 시 debounce/throttle 불필요 (검색 적용 버튼 클릭 방식)

---

## 테스트 완료 체크리스트

코드 구현은 완료되었습니다. 아래 항목을 브라우저에서 직접 테스트하세요:

### UI/UX
- [ ] 플로팅바가 오른쪽에 표시됨
- [ ] 기본 필터 (금액, 거래 일자) 표시
- [ ] "필터 추가" 버튼 동작
- [ ] 필터 추가 시 카드 생성
- [ ] 필터 제거 (X 버튼) 동작
- [ ] 초기화 버튼 동작
- [ ] 검색 적용 버튼 동작

### 필터 유형별 테스트
- [ ] Range 필터 (From/To) 입력 및 동작
- [ ] Value + Standard 필터 (숫자 + 드롭다운) 동작
- [ ] Enum 필터 (드롭다운) 동작
- [ ] Text 필터 (텍스트 입력) 동작

### 통합 테스트
- [ ] 여러 필터 동시 적용
- [ ] 검색 결과 정확성
- [ ] 페이지네이션 리셋
- [ ] 네트워크 요청 파라미터 검증

### 반응형
- [ ] 큰 화면에서 플로팅바 표시
- [ ] 작은 화면에서 플로팅바 숨김

### 에러 처리
- [ ] API 실패 시 에러 메시지 표시
- [ ] 빈 검색 결과 처리
- [ ] 잘못된 입력값 처리

---

## 추가 개선 사항 (선택)

다음 기능들은 현재 구현에 포함되지 않았지만, 향후 고려할 수 있습니다:

1. **필터 프리셋 저장**
   - 자주 사용하는 필터 조합을 저장하고 불러오기
   - LocalStorage에 저장

2. **필터 검색**
   - 16개의 필터가 많을 경우 검색 기능 추가
   - 드롭다운에 검색 입력 필드 추가

3. **필터 개수 제한**
   - 성능을 위해 동시에 추가 가능한 필터 개수 제한 (예: 최대 10개)

4. **URL 쿼리 파라미터 동기화**
   - 필터 상태를 URL에 반영하여 북마크 가능하도록
   - Next.js의 `useSearchParams`와 `useRouter` 활용

5. **키보드 단축키**
   - Enter 키로 검색 적용
   - Esc 키로 필터 드롭다운 닫기

6. **애니메이션**
   - 필터 추가/제거 시 fade-in/out 애니메이션
   - 검색 중 로딩 스피너

---

## 문의 및 이슈 보고

**문제가 발생하면**:
1. 브라우저 개발자 도구 → 콘솔 탭에서 에러 확인
2. 네트워크 탭에서 API 요청/응답 확인
3. 이 가이드의 "예상 이슈 및 해결 방법" 섹션 참고
4. GitHub Issues에 버그 리포트 제출

**성공적으로 테스트 완료 시**:
- `PROGRESS.md` 업데이트
- 테스트 완료 체크리스트 작성
