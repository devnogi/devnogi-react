"use client";

import { useState } from "react";
import Category from "@/components/page/community/Category";
import PostList from "@/components/page/community/PostList";
import PageTitle from "@/components/commons/PageTitle";
import { Button } from "@/components/ui/button";
import { Plus, Search, X } from "lucide-react";
import PostCreateModal from "@/components/page/community/PostCreateModal";

type SortType = "latest" | "popular" | "mostLiked";

function CommunityPage() {
  const [selectedBoardId, setSelectedBoardId] = useState<number | undefined>(
    undefined,
  );
  const [sortOption, setSortOption] = useState<SortType>("latest");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setKeyword("");
  };

  return (
    <main className="flex flex-col gap-6 pb-8">
      <PageTitle title="커뮤니티" />

      {/* Category Filter */}
      <Category
        selectedBoardId={selectedBoardId}
        setSelectedBoardId={setSelectedBoardId}
      />

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="게시글 검색..."
              className="w-full pl-10 pr-10 py-2.5 border border-warm-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 bg-white"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button type="submit" className="bg-forest-500 hover:bg-forest-600 rounded-xl px-6">
            검색
          </Button>
        </div>
      </form>

      {/* Search Result Info */}
      {keyword && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>&quot;{keyword}&quot; 검색 결과</span>
          <button
            onClick={handleClearSearch}
            className="text-forest-500 hover:text-forest-600 underline"
          >
            검색 초기화
          </button>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex justify-between items-center">
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortType)}
          className="border border-warm-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 bg-white text-warm-700"
        >
          <option value="latest">최신순</option>
          <option value="popular">인기순</option>
          <option value="mostLiked">좋아요순</option>
        </select>

        <Button className="gap-2 bg-forest-500 hover:bg-forest-600 rounded-xl" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          글쓰기
        </Button>
      </div>

      {/* Info: 인기순/좋아요순은 게시판 선택 필요 */}
      {(sortOption === "popular" || sortOption === "mostLiked") && !selectedBoardId && (
        <div className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
          인기순/좋아요순은 게시판을 선택해야 적용됩니다.
        </div>
      )}

      {/* Post List */}
      <PostList
        boardId={selectedBoardId}
        keyword={keyword}
        sortType={sortOption}
      />

      {/* Post Create Modal */}
      <PostCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}

export default CommunityPage;
