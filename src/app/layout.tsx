import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Devnogi",
  description: "마비노기 정보 커뮤니티",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
