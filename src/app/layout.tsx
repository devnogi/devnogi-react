import type { Metadata } from "next";
import { Pretendard } from "./fonts";
import "./globals.css";
import Providers from "@/app/_providers/Providers";

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
    <html lang="ko" className={Pretendard.variable}>
      <body className={Pretendard.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
