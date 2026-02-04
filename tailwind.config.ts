import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "Helvetica Neue",
          "Segoe UI",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "Malgun Gothic",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "sans-serif",
        ],
      },
      borderRadius: {
        xs: "2px",
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.3s ease-out",
      },
      colors: {
        // DevNogi Brand Colors - Soft & Modern
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9", // Primary Blue
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        accent: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7", // Purple accent
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
        },
        // Coral Pink - Dark Mode Primary
        coral: {
          50: "#FFF0F3",
          100: "#FFE0E8",
          200: "#FFCCD9",
          300: "#FFB3C6",
          400: "#FF8FB3",
          500: "#FF6B9D", // Primary Coral Pink
          600: "#E6527D",
          700: "#CC3D5E",
          800: "#B32D47",
          900: "#991F33",
        },
        // Navy - Dark Mode Background
        navy: {
          50: "#E8E8F0",
          100: "#C4C4D4",
          200: "#9E9EB8",
          300: "#6B6B8C",
          400: "#4A4A6A",
          500: "#2a2a45",
          600: "#252540",
          700: "#1a1a2e",
          800: "#12121f",
          900: "#0f0f1a", // Main Background
        },
      },
    },
  },
  plugins: [],
};

export default config;
