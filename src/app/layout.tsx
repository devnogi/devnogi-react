import "./globals.css";

import type { Metadata } from "next";

import Providers from "@/app/_providers/Providers";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_ORIGIN } from "@/lib/seo/site";

export const metadata: Metadata = {
  metadataBase: SITE_ORIGIN,
  title: {
    default: `${SITE_NAME} | 마비노기 경매장·시세·아이템 정보`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | 마비노기 경매장·시세·아이템 정보`,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3914922048513797"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Bungee&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
