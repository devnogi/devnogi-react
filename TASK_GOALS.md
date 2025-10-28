# 경매장 거래 내역 - 옵션 검색 플로팅바 추가 작업

## 작업 개요

경매장 거래 내역 화면(`/auction-history`)에 **카트 스타일의 플로팅바** 형태로 동적 옵션 검색 기능을 추가합니다.

## 목표

사용자가 경매장 아이템을 검색할 때 다양한 옵션 필터(밸런스, 크리티컬, 에르그 등)를 동적으로 추가/제거하며 세밀한 검색을 수행할 수 있도록 UI/UX를 개선합니다.

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **State Management**: TanStack Query (React Query)
- **UI Library**: Shadcn/UI + Tailwind CSS v4
- **API**: Backend Gateway → OAB (Open API Batch) Server

## API 명세

### Endpoint
```
GET {gatewayUrl}:8080/oab/api/search-option
```

### 응답 구조
```json
{
  "success": true,
  "code": "SEARCH_OPTION_SUCCESS",
  "message": "검색 옵션 조회 성공",
  "data": [
    {
      "id": 1,
      "searchOptionName": "밸런스",
      "searchCondition": {
        "Balance": {
          "type": "tinyint",
          "required": false
        },
        "BalanceStandard": {
          "type": "string",
          "required": false,
          "allowedValues": ["UP", "DOWN"]
        }
      },
      "displayOrder": 1
    }
  ],
  "timestamp": "2025-10-28T14:07:29Z"
}
```

### 검색 옵션 종류

API는 16개의 검색 옵션을 제공하며, 세 가지 필터 유형으로 분류됩니다:

#### 1. Range 필터 (From/To)
- **에르그**: `ErgFrom` ~ `ErgTo`
- **최대 공격력**: `MaxAttackFrom` ~ `MaxAttackTo`
- **최대 부상률**: `MaxInjuryRateFrom` ~ `MaxInjuryRateTo`

#### 2. Value + Standard 필터
값을 입력하고 UP/DOWN 기준을 선택:
- **밸런스**: `Balance` + `BalanceStandard` (UP/DOWN)
- **크리티컬**: `Critical` + `CriticalStandard` (UP/DOWN)
- **방어력**: `Defense` + `DefenseStandard` (UP/DOWN)
- **마법 방어력**: `MagicDefense` + `MagicDefenseStandard` (UP/DOWN)
- **마법 보호**: `MagicProtect` + `MagicProtectStandard` (UP/DOWN)
- **최대 내구력**: `MaximumDurability` + `MaximumDurabilityStandard` (UP/DOWN)
- **숙련도**: `Proficiency` + `ProficiencyStandard` (UP/DOWN)
- **보호**: `Protect` + `ProtectStandard` (UP/DOWN)
- **남은 거래 횟수**: `RemainingTransactionCount` + `RemainingTransactionCountStandard` (UP/DOWN)
- **남은 전용 해제 가능 횟수**: `RemainingUnsealCount` + `RemainingUnsealCountStandard` (UP/DOWN)
- **남은 사용 횟수**: `RemainingUseCount` + `RemainingUseCountStandard` (UP/DOWN)

#### 3. Enum/Text 필터
- **에르그 등급**: `ErgRank` (S등급, A등급, B등급)
- **착용 제한**: `WearingRestrictions` (텍스트 입력)

## UI/UX 디자인

### 플로팅바 위치
- **위치**: 화면 오른쪽에 고정 (fixed positioning)
- **좌표**: `right-24 top-32 bottom-8`
- **너비**: `w-80` (320px)
- **스타일**: 카드 스타일, 스크롤 가능

### 디자인 원칙
- 부드러운 모서리 (`rounded-2xl`)
- 부드러운 그림자 (`shadow-xl`)
- 흰색 배경 + 회색 테두리
- 아이콘 사용 (lucide-react)
- 그라데이션 버튼 (`from-blue-600 to-purple-600`)

### 주요 기능

1. **기본 필터** (고정)
   - 💰 금액 (최소/최대)
   - 📅 거래 일자 (시작/종료)

2. **동적 필터 추가**
   - "필터 추가" 버튼 클릭
   - 드롭다운에서 선택 가능한 옵션 목록 표시
   - 이미 추가된 필터는 목록에서 제외

3. **필터 입력 UI**
   - Range 필터: 두 개의 숫자 입력 (최소 ~ 최대)
   - Value + Standard: 숫자 입력 + 드롭다운 (UP/DOWN)
   - Enum: 드롭다운 선택
   - Text: 텍스트 입력

4. **필터 관리**
   - 각 필터 카드 우측에 X 버튼 (제거)
   - 초기화 버튼: 모든 필터 리셋
   - 검색 적용 버튼: 필터 적용하여 검색 실행

## 파일 구조

### 기존 파일 (이미 구현됨)

```
devnogi-react/
├── src/
│   ├── app/
│   │   ├── (main)/
│   │   │   └── auction-history/
│   │   │       └── page.tsx                    # 메인 페이지 (수정 필요)
│   │   └── api/
│   │       └── search-option/
│   │           └── route.ts                    # API 라우트 ✓
│   ├── components/
│   │   └── page/
│   │       └── auction-history/
│   │           ├── AuctionHistoryList.tsx      # 결과 리스트 ✓
│   │           ├── SearchFilterCard.tsx        # 플로팅바 컴포넌트 ✓
│   │           └── List.tsx                    # 구 버전 리스트
│   ├── hooks/
│   │   ├── useAuctionHistory.ts                # 경매 내역 조회 훅 ✓
│   │   └── useSearchOptions.ts                 # 검색 옵션 조회 훅 ✓
│   └── types/
│       └── search-filter.ts                    # 타입 정의 ✓
```

## 구현 상태

### ✅ 완료된 작업

1. **API 레이어**
   - `/api/search-option` 라우트 구현
   - Gateway를 통한 OAB 서버 연동
   - 30분 캐싱 설정

2. **타입 정의**
   - `SearchOptionMetadata`: 검색 옵션 메타데이터
   - `FieldMetadata`: 필드 정보 (type, required, allowedValues)
   - `ActiveFilter`: 활성화된 필터
   - `FilterValue`: 필터 값

3. **커스텀 훅**
   - `useSearchOptions`: 검색 옵션 메타데이터 조회
   - `useAuctionHistory`: 경매 내역 조회 (검색 파라미터 지원)

4. **SearchFilterCard 컴포넌트**
   - 플로팅바 UI 구현
   - 필터 타입 자동 분석 (range, valueWithStandard, enum, text)
   - 동적 입력 필드 렌더링
   - 필터 추가/제거 로직
   - 초기화 및 검색 적용 버튼

### ❌ 남은 작업

1. **페이지 통합**
   - `page.tsx`에 `SearchFilterCard` import 및 렌더링
   - 레이아웃 조정 (왼쪽 카테고리, 중앙 컨텐츠, 오른쪽 필터)

2. **검색 로직 연결**
   - `onFilterApply` 콜백을 통해 필터 값을 `searchParams`에 병합
   - `useAuctionHistory` 훅에 필터 파라미터 전달
   - 페이지네이션 리셋 (필터 변경 시 1페이지로)

3. **테스트**
   - 각 필터 유형별 동작 확인
   - API 파라미터 전달 검증
   - UI/UX 테스트

## 기술적 고려사항

### 1. 필터 타입 분석 로직

`SearchFilterCard` 컴포넌트는 `analyzeFilterType` 함수를 사용하여 `searchCondition` 객체의 필드명과 메타데이터를 분석하고 자동으로 필터 유형을 결정합니다:

```typescript
const analyzeFilterType = (searchCondition: Record<string, FieldMetadata>) => {
  const fieldNames = Object.keys(searchCondition);

  // Range 필터: From/To 패턴
  const hasFromTo = fieldNames.some(name =>
    name.endsWith("From") && fieldNames.includes(name.replace("From", "To"))
  );
  if (hasFromTo) return "range";

  // Value + Standard 필터: Standard 접미사
  const hasStandard = fieldNames.some(name => name.endsWith("Standard"));
  if (hasStandard) return "valueWithStandard";

  // Enum 필터: allowedValues 존재
  const hasEnum = Object.values(searchCondition).some(
    metadata => metadata.allowedValues && metadata.allowedValues.length > 0
  );
  if (hasEnum) return "enum";

  // 기본: Text 필터
  return "text";
};
```

### 2. API 파라미터 병합

기존 검색 파라미터(아이템명, 카테고리)와 동적 필터를 병합:

```typescript
const handleFilterApply = (filters: Record<string, string | number>) => {
  setSearchParams({
    ...searchParams,  // 기존 itemName, itemTopCategory, itemSubCategory
    ...filters,       // 동적 필터 (Balance, BalanceStandard, ErgFrom, ErgTo 등)
  });
  setCurrentPage(1);  // 페이지 리셋
};
```

### 3. 레이아웃 구조

```
┌─────────────────────────────────────────────────────────────┐
│                         NavBar                              │
├───────────┬──────────────────────────────┬─────────────────┤
│           │                              │                 │
│ Category  │    Main Content Area         │  Filter Card    │
│ Sidebar   │    (Search + Results)        │  (Floating)     │
│ (Left)    │    (Center)                  │  (Right)        │
│           │                              │                 │
│ fixed     │    max-w-4xl                 │  fixed          │
│ left-24   │    centered                  │  right-24       │
│ w-56      │                              │  w-80           │
│           │                              │                 │
└───────────┴──────────────────────────────┴─────────────────┘
```

## 참고사항

### 검색 API 파라미터

`useAuctionHistory` 훅이 지원하는 파라미터:

**기본 파라미터:**
- `itemName`: 아이템명 (string)
- `itemTopCategory`: 최상위 카테고리 (string)
- `itemSubCategory`: 하위 카테고리 (string)
- `page`: 페이지 번호 (number)
- `size`: 페이지 크기 (number)

**동적 필터 파라미터:**
- 모든 검색 옵션의 필드명을 그대로 파라미터로 전달
- 예: `Balance=50`, `BalanceStandard=UP`, `ErgFrom=20`, `ErgTo=50`

### 디자인 시스템 준수

- **Border Radius**: 16-24px (`rounded-2xl`)
- **Shadows**: 부드러운 그림자 (`shadow-xl`)
- **Colors**: Brand blue (#0ea5e9), Accent purple (#a855f7)
- **Spacing**: 너그러운 여백 (`p-6`, `gap-4`)
- **Font**: Pretendard
- **Interactions**: 200-300ms transition, scale hover effects

### 접근성

- **Keyboard Navigation**: Tab으로 모든 요소 접근 가능
- **Focus States**: 명확한 포커스 링 (`focus:ring-2 focus:ring-blue-500`)
- **Screen Readers**: 적절한 ARIA 레이블
- **Touch Targets**: 최소 44x44px

## 예상 결과

사용자는 경매장 거래 내역 화면에서:

1. 왼쪽 사이드바에서 카테고리 선택
2. 중앙 상단에서 아이템명 검색
3. **오른쪽 플로팅바에서 세밀한 옵션 필터 추가/조정**
4. "검색 적용" 버튼 클릭으로 모든 조건을 결합한 검색 수행
5. 결과를 중앙 영역에서 확인

이를 통해 사용자는 "밸런스 50 이상, 크리티컬 30 이상, 에르그 20~50 범위, 가격 1,000,000~5,000,000 골드" 같은 복잡한 조건의 검색을 직관적으로 수행할 수 있습니다.
