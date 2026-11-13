"use client";

import { Loader2, PenLine } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import LoginModal from "@/components/auth/LoginModal";
import { PopularPostsContent } from "@/components/page/community/PopularPostsHighlight";
import PostComposer from "@/components/page/community/PostComposer";
import PostCreateModal from "@/components/page/community/PostCreateModal";
import PostList from "@/components/page/community/PostList";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useInfinitePosts } from "@/hooks/useInfinitePosts";
import type { BackendPostsData } from "@/lib/community/feed";
import type { FeedTab } from "@/types/community";

const tabs: Array<{ value: FeedTab; label: string }> = [
  { value: "latest", label: "최신" },
  { value: "popular", label: "인기" },
  { value: "bookmarks", label: "저장됨" },
  { value: "mine", label: "내 글" },
];

interface Props {
  initial?: BackendPostsData;
  startPage?: number;
}

function CommunityPageContent({ initial, startPage = 1 }: Props) {
  const keyword = useSearchParams().get("q") ?? "";
  const [tab, setTab] = useState<FeedTab>("latest");
  const [composerOpen, setComposerOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const popular = useInfinitePosts({ tab: "popular", size: 10 });
  const showPopular =
    popular.isLoading ||
    (!popular.isError &&
      Boolean(popular.data?.pages.some((page) => page.items.length > 0)));
  const openComposer = () => {
    if (authLoading) return;
    if (isAuthenticated) setComposerOpen(true);
    else setLoginOpen(true);
  };

  return (
    <main
      className={`visual-polish social-reading-page mx-auto w-full pb-24 ${showPopular ? "max-w-[680px] lg:max-w-[980px]" : "max-w-[680px]"}`}
    >
      <div
        className={`grid items-start gap-5 ${showPopular ? "lg:grid-cols-[minmax(0,680px)_280px]" : ""}`}
      >
        <section className="min-w-0 overflow-hidden bg-card text-card-foreground sm:rounded-[10px] sm:border sm:border-border">
          <header className="border-b border-border px-4 pt-4 sm:px-5">
            <div className="mb-3">
              <h1 className="text-xl font-bold text-card-foreground">
                마비노기 커뮤니티
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                에린 이야기 · 마비노기 질문과 플레이 경험을 나눠보세요.
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
                  className={`relative flex h-12 flex-1 items-center justify-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring ${tab === item.value ? "text-[var(--color-ds-primary)]" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"}`}
                  aria-current={tab === item.value ? "page" : undefined}
                >
                  {item.label}
                  {tab === item.value && (
                    <span className="absolute inset-x-5 bottom-0 h-0.5 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </nav>
          </header>
          <div
            className={`border-b border-border ${isAuthenticated ? "hidden sm:block" : ""}`}
          >
            {authLoading ? (
              <div
                role="status"
                className="flex min-h-28 items-center justify-center text-sm text-gray-500 dark:text-gray-400"
              >
                로그인 상태를 확인하는 중입니다.
              </div>
            ) : isAuthenticated ? (
              <PostComposer compact />
            ) : (
              <div className="flex min-h-28 items-center justify-center px-4 py-5">
                <Button
                  type="button"
                  className="min-h-11"
                  onClick={openComposer}
                >
                  로그인하고 이야기 남기기
                </Button>
              </div>
            )}
          </div>
          <PostList
            tab={tab}
            keyword={keyword || undefined}
            initial={tab === "latest" ? initial : undefined}
            startPage={tab === "latest" ? startPage : 1}
          />
        </section>
        {showPopular && (
          <aside aria-label="인기 게시글" className="hidden lg:block">
            <div className="sticky top-[116px]">
              <PopularPostsContent
                data={popular.data}
                isLoading={popular.isLoading}
                isError={popular.isError}
              />
            </div>
          </aside>
        )}
      </div>
      <button
        type="button"
        onClick={openComposer}
        disabled={authLoading}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-[var(--color-ds-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 sm:bottom-6 lg:hidden"
        aria-label="글쓰기"
      >
        <PenLine className="h-5 w-5" />
      </button>
      <PostCreateModal
        isOpen={isAuthenticated && composerOpen}
        onClose={() => setComposerOpen(false)}
      />
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={() => setComposerOpen(true)}
      />
    </main>
  );
}

export default function CommunityPage(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
        </div>
      }
    >
      <CommunityPageContent {...props} />
    </Suspense>
  );
}
