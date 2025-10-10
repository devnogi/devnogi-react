# Pretendard 폰트 설치 안내

DevNogi 프로젝트는 **Pretendard** 폰트를 사용합니다.

## 폰트 다운로드

1. Pretendard 공식 저장소 방문: https://github.com/orioncactus/pretendard
2. Releases 페이지에서 최신 버전 다운로드
3. `Pretendard-x.x.x.zip` 파일 압축 해제
4. `woff2` 폴더에서 다음 파일들을 이 디렉토리에 복사:

```
src/app/fonts/
├── Pretendard-Thin.woff2
├── Pretendard-ExtraLight.woff2
├── Pretendard-Light.woff2
├── Pretendard-Regular.woff2
├── Pretendard-Medium.woff2
├── Pretendard-SemiBold.woff2
├── Pretendard-Bold.woff2
├── Pretendard-ExtraBold.woff2
└── Pretendard-Black.woff2
```

## 또는 CDN 사용 (대안)

폰트 파일을 직접 다운로드하지 않고 CDN을 사용하려면:

1. `src/app/fonts.ts` 파일 수정
2. `localFont` 대신 `next/font/google` 또는 CDN 링크 사용

## 라이선스

Pretendard는 **SIL Open Font License 1.1**로 배포되며 상업적 사용이 가능합니다.

- 웹사이트: https://cactus.tistory.com/306
- 라이선스: https://github.com/orioncactus/pretendard/blob/main/LICENSE
