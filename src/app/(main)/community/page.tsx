"use client";

import { useState } from "react";
import Category from "@/components/page/community/Category";
import PostList from "@/components/page/community/PostList";
import PageTitle from "@/components/commons/PageTitle";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PostCreateModal from "@/components/page/community/PostCreateModal";

function CommunityPage() {
  const [selectedBoardId, setSelectedBoardId] = useState<number | undefined>(
    undefined,
  );
  const [sortOption, setSortOption] = useState("latest");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="flex flex-col gap-6 pb-8">
      <PageTitle title="커뮤니티" />

      {/* Category Filter */}
      <Category
        selectedBoardId={selectedBoardId}
        setSelectedBoardId={setSelectedBoardId}
      />

      {/* Actions Bar */}
      <div className="flex justify-between items-center">
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border border-warm-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 bg-white text-warm-700"
        >
          <option value="latest">최신순</option>
          <option value="popular">인기순</option>
          <option value="comments">댓글순</option>
          <option value="views">조회순</option>
        </select>

        <Button className="gap-2 bg-forest-500 hover:bg-forest-600 rounded-xl" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          글쓰기
        </Button>
      </div>

      {/* Post List */}
      <PostList boardId={selectedBoardId} />

      {/* Post Create Modal */}
      <PostCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}

export default CommunityPage;
