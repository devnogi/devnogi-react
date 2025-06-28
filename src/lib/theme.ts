// 프로젝트 테마 색상 정의
export const themeColors = {
  // 기본 색상
  white: '#FFFFFF',
  black: '#000000',
  
  // 주요 색상
  blue: '#0000C0',
  red: '#C00000',
  yellow: '#FFFF00',
  
  // 그레이 톤
  lightGray: '#D3D3D3',
  darkGray: '#282828',
  
  // 확장 색상
  cobaltBlue: '#3678F1',
  brightRed: '#CF1414',
  bananaYellow: '#FFE062',
  ivoryIce: '#DEBA86',
  hydranPink: '#FFBFCA',
  chocoBrown: '#4E2E28',
  delegateGreen: '#7DDCC4',
  purple: '#800080',
} as const;

// 색상 타입 정의
export type ThemeColor = keyof typeof themeColors;
export type ThemeColorValue = typeof themeColors[ThemeColor];

// 색상 카테고리별 그룹화
export const colorCategories = {
  primary: {
    blue: themeColors.blue,
    red: themeColors.red,
    yellow: themeColors.yellow,
  },
  neutral: {
    white: themeColors.white,
    black: themeColors.black,
    lightGray: themeColors.lightGray,
    darkGray: themeColors.darkGray,
  },
  accent: {
    cobaltBlue: themeColors.cobaltBlue,
    brightRed: themeColors.brightRed,
    bananaYellow: themeColors.bananaYellow,
    ivoryIce: themeColors.ivoryIce,
    hydranPink: themeColors.hydranPink,
    chocoBrown: themeColors.chocoBrown,
    delegateGreen: themeColors.delegateGreen,
    purple: themeColors.purple,
  },
} as const;

// CSS 변수 이름 생성 함수
export const getCssVariableName = (colorName: ThemeColor): string => {
  return `--color-${colorName.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
};

// 색상 값 가져오기 함수
export const getThemeColor = (colorName: ThemeColor): ThemeColorValue => {
  return themeColors[colorName];
};

// CSS 변수로 색상 가져오기 함수
export const getCssVariableColor = (colorName: ThemeColor): string => {
  return `var(${getCssVariableName(colorName)})`;
};

// 색상 유효성 검사 함수
export const isValidThemeColor = (color: string): color is ThemeColorValue => {
  return Object.values(themeColors).includes(color as ThemeColorValue);
};

// 색상 이름으로 색상 찾기 함수
export const findColorByName = (colorValue: string): ThemeColor | null => {
  const entry = Object.entries(themeColors).find(([_, value]) => value === colorValue);
  return entry ? (entry[0] as ThemeColor) : null;
}; 