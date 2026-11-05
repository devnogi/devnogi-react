"use client";

import { Loader2, PenLine } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import PopularPostsHighlight from "@/components/page/community/PopularPostsHighlight";
import PostComposer from "@/components/page/community/PostComposer";
import PostCreateModal from "@/components/page/community/PostCreateModal";
import PostList from "@/components/page/community/PostList";
import type { FeedTab } from "@/types/community";

const tabs: Array<{ value: FeedTab; label: string }> = [
  { value: "latest", label: "최신" },
  { value: "popular", label: "인기" },
  { value: "bookmarks", label: "저장됨" },
  { value: "mine", label: "내 글" },
];

function CommunityPageContent() {
  const keyword = useSearchParams().get("q") ?? "";
  const [tab, setTab] = useState<FeedTab>("latest");
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <main className="mx-auto w-full max-w-[1000px] pb-24">
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,680px)_280px]">
        <section className="min-w-0 overflow-hidden border-x border-gray-200 bg-white dark:border-navy-600 dark:bg-navy-800 sm:rounded-2xl sm:border">
          <header className="border-b border-gray-200 px-4 pt-4 dark:border-navy-600 sm:px-5">
            <div className="mb-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                에린 이야기
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                길게 고민하지 말고, 오늘의 한 장면을 가볍게 나눠보세요.
              </p>
            </div>
            {keyword && (
              <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                &quot;{keyword}&quot; 검색 결과
              </p>
            )}
            <nav className="flex" aria-label="커뮤니티 피드">
              {tabs.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTab(item.value)}
                  className={`relative flex h-12 flex-1 items-center justify-center text-sm font-semibold ${tab === item.value ? "text-[#7f3819] dark:text-gold-300" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"}`}
                  aria-current={tab === item.value ? "page" : undefined}
                >
                  {item.label}
                  {tab === item.value && (
                    <span className="absolute inset-x-5 bottom-0 h-0.5 rounded-full bg-[#9a451f] dark:bg-gold-400" />
                  )}
                </button>
              ))}
            </nav>
          </header>
          <div className="hidden border-b border-gray-200 dark:border-navy-600 sm:block">
            <PostComposer compact />
          </div>
          <PostList tab={tab} keyword={keyword || undefined} />
        </section>
        <aside className="hidden lg:block">
          <div className="sticky top-[116px]">
            <PopularPostsHighlight />
          </div>
        </aside>
      </div>
      <button
        type="button"
        onClick={() => setComposerOpen(true)}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#9a451f] text-white shadow-lg dark:bg-gold-400 dark:text-navy-900 sm:bottom-6 lg:hidden"
        aria-label="글쓰기"
      >
        <PenLine className="h-5 w-5" />
      </button>
      <PostCreateModal
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
      />
    </main>
  );
}

export default function CommunityPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
        </div>
      }
    >
      <CommunityPageContent />
    </Suspense>
  );
}
