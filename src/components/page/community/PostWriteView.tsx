"use client";

import Link from "next/link";

import PostComposer from "./PostComposer";

export default function PostWriteView() {
  return (
    <main className="mx-auto w-full max-w-[680px] overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-navy-600 dark:bg-navy-800">
      <header className="flex h-14 items-center border-b border-gray-100 px-4 dark:border-navy-600">
        <Link
          href="/community"
          className="flex h-11 items-center px-2 text-sm font-medium text-[#9a451f] dark:text-gold-300"
        >
          취소
        </Link>
        <h1 className="ml-3 font-semibold text-gray-900 dark:text-white">
          새 이야기
        </h1>
      </header>
      <PostComposer autoFocus />
    </main>
  );
}
