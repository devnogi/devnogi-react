import type { Metadata } from "next";

import { createPageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = createPageMetadata({
  title: "개인정보 문의",
  description: "메모노기 개인정보 처리 관련 문의 방법을 안내합니다.",
  pathname: "/contact",
});

export default function ContactPage() {
  return (
    <article className="mx-auto max-w-3xl rounded-lg border border-border bg-card p-5 sm:p-8">
      <h1 className="text-2xl font-semibold text-foreground">개인정보 문의</h1>
      <p className="mt-4 text-sm leading-7 text-gray-700 dark:text-gray-200">
        개인정보 처리, 열람·정정·삭제·처리정지 요청 등 개인정보처리방침에 관한
        문의는 아래 전자우편으로 보내 주세요.
      </p>
      <a
        href="mailto:privacy@devnogi.com"
        className="mt-4 inline-flex text-sm font-semibold text-primary underline underline-offset-4 hover:no-underline"
      >
        privacy@devnogi.com
      </a>
      <p className="mt-6 text-xs leading-5 text-gray-500 dark:text-gray-400">
        이 연락처는 개인정보 처리 관련 문의를 위한 창구입니다. 일반 서비스 문의
        채널은 현재 이 페이지에서 별도로 안내하지 않습니다.
      </p>
    </article>
  );
}
