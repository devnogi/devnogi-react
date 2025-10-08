# API Documentation

## 목차
- [경매장 거래 내역 API](#경매장-거래-내역-api)
- [아이템 정보 API](#아이템-정보-api)
- [아이템 일간 최저가 API](#아이템-일간-최저가-api)
- [공통 모델](#공통-모델)

---

## 경매장 거래 내역 API

### 1. 경매장 거래 내역 검색
**Endpoint:** `GET /auction-history/search`

**설명:** Nexon Open API 경매장 거래 내역 검색

**Query Parameters:**
- 페이지네이션 (PageRequestDto)
  - `page` (Integer, optional): 요청할 페이지 번호 (1부터 시작), 기본값: 1
  - `size` (Integer, optional): 페이지당 항목 수 (1-100), 기본값: 20
  - `sortBy` (String, optional): 정렬 필드, 기본값: "id"
  - `direction` (String, optional): 정렬 방향 (asc/desc), 기본값: "desc"

- 검색 조건 (AuctionHistorySearchRequest)
  - `itemName` (String, optional): 아이템 이름 (like 검색)
    - 예시: "페러시우스 타이탄 블레이드"
  - `itemTopCategory` (String, optional): 대분류 카테고리
    - 예시: "근거리 장비"
  - `itemSubCategory` (String, optional): 소분류 카테고리
    - 예시: "검"

**Response:**
```json
{
  "items": [
    {
      "itemName": "페러시우스 타이탄 블레이드",
      "itemDisplayName": "페러시우스 타이탄 블레이드",
      "itemCount": 1,
      "auctionPricePerUnit": 150000,
      "dateAuctionBuy": "2025-07-01T10:30:00Z",
      "auctionBuyId": "abc123",
      "itemSubCategory": "검",
      "itemTopCategory": "근거리 장비",
      "itemOptions": [
        {
          "id": "opt1",
          "optionType": "강화",
          "optionSubType": "공격력",
          "optionValue": "15",
          "optionValue2": null,
          "optionDesc": "공격력 +15"
        }
      ]
    }
  ],
  "meta": {
    "currentPage": 1,
    "pageSize": 20,
    "totalPages": 5,
    "totalElements": 100,
    "isFirst": true,
    "isLast": false
  }
}
```

**Response Schema:**
- `PageResponseDto<AuctionHistoryDetailResponse<ItemOptionResponse>>`

---

### 2. 경매장 거래 내역 단건 조회
**Endpoint:** `GET /auction-history/{id}`

**설명:** Nexon Open API 경매장 거래 내역 단건 조회

**Path Parameters:**
- `id` (String, required): 거래 ID

**Response:**
```json
{
  "itemName": "페러시우스 타이탄 블레이드",
  "itemDisplayName": "페러시우스 타이탄 블레이드",
  "itemCount": 1,
  "auctionPricePerUnit": 150000,
  "dateAuctionBuy": "2025-07-01T10:30:00Z",
  "auctionBuyId": "abc123",
  "itemSubCategory": "검",
  "itemTopCategory": "근거리 장비",
  "itemOptions": [
    {
      "id": "opt1",
      "optionType": "강화",
      "optionSubType": "공격력",
      "optionValue": "15",
      "optionValue2": null,
      "optionDesc": "공격력 +15"
    }
  ]
}
```

**Response Schema:**
- `AuctionHistoryDetailResponse<ItemOptionResponse>`

---

### 3. 경매장 거래 내역 배치 실행
**Endpoint:** `POST /auction-history/batch`

**설명:** Nexon Open API 경매장 거래 내역 모든 카테고리 데이터 INSERT 배치 실행

**Request:** 없음

**Response:**
- Status: 200 OK
- Body: 없음

---

## 아이템 정보 API

### 1. 카테고리 정보 조회
**Endpoint:** `GET /api/item-infos/categories`

**설명:** 아이템 상위 카테고리, 하위 카테고리 정보 조회

**Request:** 없음

**Response:**
```json
{
  "success": true,
  "code": "COMMON_SUCCESS",
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": [
    {
      "subCategory": "한손검",
      "topCategory": "무기"
    },
    {
      "subCategory": "양손검",
      "topCategory": "무기"
    }
  ],
  "timestamp": "2025-07-01T10:30:00Z"
}
```

**Response Schema:**
- `ApiResponse<List<ItemCategoryResponse>>`

---

### 2. 모든 아이템 정보 조회
**Endpoint:** `GET /api/item-infos`

**설명:** 시스템에 저장된 모든 아이템 정보를 조회

**Request:** 없음

**Response:**
```json
[
  {
    "name": "나뭇가지",
    "topCategory": "무기",
    "subCategory": "한손검",
    "description": "흔한 나뭇가지이다.",
    "inventoryWidth": 1,
    "inventoryHeight": 2,
    "inventoryMaxBundleCount": 100,
    "history": "나뭇가지의 역사",
    "acquisitionMethod": "필드 드랍",
    "storeSalesPrice": "100 골드",
    "weaponType": "한손검 - 빠름",
    "repair": "수리 가능",
    "maxAlterationCount": 5
  }
]
```

**Response Schema:**
- `List<ItemInfoResponse>`

---

### 3. 상위 카테고리로 검색
**Endpoint:** `GET /api/item-infos/search/top-category`

**설명:** 상위 카테고리 이름으로 아이템 정보를 검색

**Query Parameters:**
- `topCategory` (String, required): 검색할 상위 카테고리
  - 예시: "무기"

**Response:**
```json
[
  {
    "name": "나뭇가지",
    "topCategory": "무기",
    "subCategory": "한손검",
    "description": "흔한 나뭇가지이다.",
    "inventoryWidth": 1,
    "inventoryHeight": 2,
    "inventoryMaxBundleCount": 100,
    "history": "나뭇가지의 역사",
    "acquisitionMethod": "필드 드랍",
    "storeSalesPrice": "100 골드",
    "weaponType": "한손검 - 빠름",
    "repair": "수리 가능",
    "maxAlterationCount": 5
  }
]
```

**Response Schema:**
- `List<ItemInfoResponse>`

---

### 4. 하위 카테고리로 검색
**Endpoint:** `GET /api/item-infos/search/sub-category`

**설명:** 하위 카테고리 이름으로 아이템 정보를 검색

**Query Parameters:**
- `subCategory` (String, required): 검색할 하위 카테고리
  - 예시: "한손검"

**Response:**
```json
[
  {
    "name": "나뭇가지",
    "topCategory": "무기",
    "subCategory": "한손검",
    "description": "흔한 나뭇가지이다.",
    "inventoryWidth": 1,
    "inventoryHeight": 2,
    "inventoryMaxBundleCount": 100,
    "history": "나뭇가지의 역사",
    "acquisitionMethod": "필드 드랍",
    "storeSalesPrice": "100 골드",
    "weaponType": "한손검 - 빠름",
    "repair": "수리 가능",
    "maxAlterationCount": 5
  }
]
```

**Response Schema:**
- `List<ItemInfoResponse>`

---

## 아이템 일간 최저가 API

### 1. 최저가 배치 실행
**Endpoint:** `POST /api/item-min-prices/batch`

**설명:** auction_history로부터 오늘의 최저가 데이터를 계산해 item_daily_min_price 테이블에 upsert

**Request:** 없음

**Response:**
- Status: 200 OK
- Body: 없음

---

### 2. 최저가 전체 조회
**Endpoint:** `GET /api/item-min-prices`

**설명:** item_daily_min_price 테이블의 모든 데이터를 반환

**Request:** 없음

**Response:**
```json
[
  {
    "id": 1,
    "itemName": "켈틱 로열 나이트 소드",
    "minPrice": 120000,
    "dateAuctionBuy": "2025-07-01T14:35:00",
    "createdAt": "2025-07-01"
  }
]
```

**Response Schema:**
- `List<ItemDailyMinPriceResponseDto>`

---

## 공통 모델

### PageRequestDto (Query Parameters)
페이지네이션을 위한 요청 파라미터

**Fields:**
- `page` (Integer, optional): 요청할 페이지 번호 (1부터 시작)
  - 최소값: 1
  - 기본값: 1
  - 예시: 1
- `size` (Integer, optional): 페이지당 항목 수
  - 최소값: 1
  - 최대값: 100
  - 기본값: 20
  - 예시: 20
- `sortBy` (String, optional): 정렬 필드
  - 기본값: "id"
  - 예시: "createdAt"
- `direction` (String, optional): 정렬 방향
  - 값: "asc" 또는 "desc"
  - 기본값: "desc"
  - 예시: "desc"

---

### PageResponseDto
페이지네이션 응답 객체

**Fields:**
- `items` (Array): 데이터 리스트
- `meta` (PageMeta): 페이지 메타데이터

---

### PageMeta
페이지 응답 메타데이터

**Fields:**
- `currentPage` (Integer): 현재 페이지 번호 (1부터 시작)
  - 예시: 1
- `pageSize` (Integer): 페이지당 항목 수
  - 예시: 20
- `totalPages` (Integer): 전체 페이지 수
  - 예시: 5
- `totalElements` (Long): 전체 항목 수
  - 예시: 100
- `isFirst` (Boolean): 첫 페이지 여부
  - 예시: true
- `isLast` (Boolean): 마지막 페이지 여부
  - 예시: false

---

### ApiResponse
표준 API 응답 래퍼

**Fields:**
- `success` (Boolean): 성공 여부
- `code` (String): 응답 코드
- `message` (String): 응답 메시지
- `data` (Generic): 실제 데이터
- `timestamp` (String): 응답 시간 (ISO-8601 형식)

---

### AuctionHistoryDetailResponse
경매장 거래 내역 상세 정보

**Fields:**
- `itemName` (String): 아이템 이름
- `itemDisplayName` (String): 아이템 표시 이름
- `itemCount` (Long): 아이템 개수
- `auctionPricePerUnit` (Long): 단가
- `dateAuctionBuy` (String): 거래 발생 시각 (ISO-8601 형식)
- `auctionBuyId` (String): 거래 ID
- `itemSubCategory` (String): 소분류 카테고리
- `itemTopCategory` (String): 대분류 카테고리
- `itemOptions` (Array<ItemOptionResponse>): 아이템 옵션 리스트

---

### ItemOptionResponse
아이템 옵션 정보

**Fields:**
- `id` (String): 옵션 ID
- `optionType` (String): 옵션 타입
- `optionSubType` (String): 옵션 서브 타입
- `optionValue` (String): 옵션 값
- `optionValue2` (String): 옵션 값 2
- `optionDesc` (String): 옵션 설명

---

### ItemCategoryResponse
아이템 카테고리 정보

**Fields:**
- `subCategory` (String): 하위 카테고리
- `topCategory` (String): 상위 카테고리

---

### ItemInfoResponse
아이템 정보 응답

**Fields:**
- `name` (String): 아이템 이름
  - 예시: "나뭇가지"
- `topCategory` (String): 상위 카테고리
  - 예시: "무기"
- `subCategory` (String): 하위 카테고리
  - 예시: "한손검"
- `description` (String): 아이템 설명
  - 예시: "흔한 나뭇가지이다."
- `inventoryWidth` (Byte): 인벤토리 가로 크기
  - 예시: 1
- `inventoryHeight` (Byte): 인벤토리 세로 크기
  - 예시: 2
- `inventoryMaxBundleCount` (Integer): 최대 번들 가능 개수
  - 예시: 100
- `history` (String): 아이템 역사
- `acquisitionMethod` (String): 입수 방법
- `storeSalesPrice` (String): 1개 상점 판매가
- `weaponType` (String): 공격 속도 및 무기 타입
- `repair` (String): 수리 정보
- `maxAlterationCount` (Byte): 최대 개조 횟수

---

### ItemDailyMinPriceResponseDto
아이템 일간 최저가 정보

**Fields:**
- `id` (Long): 고유 식별자
  - 예시: 1
- `itemName` (String): 아이템 이름
  - 예시: "켈틱 로열 나이트 소드"
- `minPrice` (Long): 기록된 최저 단가
  - 예시: 120000
- `dateAuctionBuy` (LocalDateTime): 해당 가격이 발견된 시각 (거래 발생 시각)
  - 예시: "2025-07-01T14:35:00"
- `createdAt` (LocalDate): 데이터가 저장된 일자
  - 예시: "2025-07-01"

---

## 노트

### 베이스 URL
개발 환경에 따라 베이스 URL을 설정하세요.

### 인증
현재 문서화된 엔드포인트에는 인증이 명시되어 있지 않습니다. 실제 배포 환경에서는 인증 메커니즘을 추가해야 할 수 있습니다.

### 에러 응답
공통 에러 응답은 다음과 같은 형식을 따릅니다:
```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "에러 메시지",
  "data": null,
  "timestamp": "2025-07-01T10:30:00Z"
}
```
