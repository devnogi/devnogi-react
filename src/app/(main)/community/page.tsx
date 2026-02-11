"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Category from "@/components/page/community/Category";
import PostList from "@/components/page/community/PostList";
import PopularPostsHighlight from "@/components/page/community/PopularPostsHighlight";
import { Plus, Search, X, Loader2, UserRound } from "lucide-react";
import PostCreateModal from "@/components/page/community/PostCreateModal";
import { useAuth } from "@/contexts/AuthContext";

type SortType = "latest" | "popular" | "mostLiked";

function CommunityPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const keyword = searchParams.get("q") || "";

  const [selectedBoardId, setSelectedBoardId] = useState<number | undefined>(
    undefined,
  );
  const [sortOption, setSortOption] = useState<SortType>("latest");
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileSearchInput, setMobileSearchInput] = useState(keyword);
  const { user, isAuthenticated } = useAuth();

  // URL의 검색어가 변경되면 모바일 input 동기화
  useEffect(() => {
    setMobileSearchInput(keyword);
  }, [keyword]);

  const handleMobileSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedInput = mobileSearchInput.trim();
      if (trimmedInput) {
        router.push(`/community?q=${encodeURIComponent(trimmedInput)}`);
      } else {
        router.push("/community");
      }
    },
    [mobileSearchInput, router]
  );

  const handleClearMobileSearch = useCallback(() => {
    setMobileSearchInput("");
    router.push("/community");
  }, [router]);

  return (
    <main className="flex flex-col gap-6 pb-24">
      {/* Mobile Search Bar - Only visible on mobile */}
      <form onSubmit={handleMobileSearch} className="md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={mobileSearchInput}
            onChange={(e) => setMobileSearchInput(e.target.value)}
            placeholder="게시글 검색..."
            className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-ds-primary)]/20 focus:border-[var(--color-ds-primary)] transition-colors"
          />
          {mobileSearchInput && (
            <button
              type="button"
              onClick={handleClearMobileSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Category Filter */}
      <Category
        selectedBoardId={selectedBoardId}
        setSelectedBoardId={setSelectedBoardId}
      />

      {/* Mobile Popular Posts */}
      <div className="md:hidden">
        <PopularPostsHighlight boardId={selectedBoardId} />
      </div>

      {/* Desktop/Tablet Layout: Post List + Popular Card */}
      <div className="md:grid md:grid-cols-[minmax(0,1fr)_320px] md:gap-6 lg:gap-8">
        <section className="min-w-0 space-y-4">
          {/* Search Result Info */}
          {keyword && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>&quot;{keyword}&quot; 검색 결과</span>
            </div>
          )}

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortType)}
              disabled={showMyPosts}
              className="border border-gray-200 dark:border-navy-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ds-primary)]/20 focus:border-[var(--color-ds-primary)] bg-white dark:bg-navy-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
            >
              <option value="latest">최신순</option>
              <option value="popular">인기순</option>
              <option value="mostLiked">좋아요순</option>
            </select>
            {isAuthenticated && (
              <button
                onClick={() => setShowMyPosts((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border transition-colors ${
                  showMyPosts
                    ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100"
                    : "bg-white dark:bg-navy-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-navy-600 hover:bg-gray-50 dark:hover:bg-navy-600"
                }`}
              >
                <UserRound className="w-4 h-4" />
                내 글
              </button>
            )}
          </div>

          {/* Info: 인기순/좋아요순은 게시판 선택 필요 */}
          {(sortOption === "popular" || sortOption === "mostLiked") && !selectedBoardId && (
            <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg">
              인기순/좋아요순은 게시판을 선택해야 적용됩니다.
            </div>
          )}

          {/* Post List */}
          <PostList
            boardId={showMyPosts ? undefined : selectedBoardId}
            keyword={showMyPosts ? undefined : keyword}
            sortType={showMyPosts ? undefined : sortOption}
            userId={showMyPosts ? user?.userId : undefined}
          />
        </section>

        <aside className="hidden md:block">
          <div className="sticky top-[116px]">
            <PopularPostsHighlight boardId={selectedBoardId} />
          </div>
        </aside>
      </div>

      {/* FAB - Write Post Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 w-14 h-14 bg-[var(--color-ds-primary)] hover:bg-[var(--color-ds-primary-hover)] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95"
        aria-label="글쓰기"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Post Create Modal */}
      <PostCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}

function CommunityPageFallback() {
  return (
    <main className="flex flex-col gap-6 pb-24">
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    </main>
  );
}

export default function CommunityPage() {
  return (
    <Suspense fallback={<CommunityPageFallback />}>
      <CommunityPageContent />
    </Suspense>
  );
}
