import localFont from "next/font/local";

/**
 * Pretendard 폰트
 * - 한국어와 영문 모두 지원하는 현대적인 sans-serif 폰트
 * - SIL Open Font License로 상업적 사용 가능
 * - 가독성이 우수하고 다양한 굵기 지원
 * - Apple SD Gothic Neo, Roboto 등의 장점을 계승
 */
export const Pretendard = localFont({
  src: [
    {
      path: "./fonts/Pretendard-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "./fonts/Pretendard-ExtraLight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/Pretendard-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/Pretendard-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Pretendard-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Pretendard-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Pretendard-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Pretendard-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/Pretendard-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
});

/**
 * Mabinogi Classic 폰트 (게임 타이틀 전용)
 * - 마비노기 브랜딩 요소로만 제한적 사용
 * - OTF 원본 파일 그대로 사용 (저작권 조건)
 * - 변환 금지
 */
export const MabinogiClassic = localFont({
  src: "./Mabinogi_Classic_OTF.otf",
  variable: "--font-mabinogi",
  display: "swap",
});
