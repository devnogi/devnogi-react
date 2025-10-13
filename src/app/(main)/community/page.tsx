"use client";

import { useState } from "react";
import Category from "@/components/page/community/Category";
import PostList from "@/components/page/community/PostList";
import PageTitle from "@/components/commons/PageTitle";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

function CommunityPage() {
  const [selectedBoardId, setSelectedBoardId] = useState<number | undefined>(
    undefined,
  );
  const [sortOption, setSortOption] = useState("latest");

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
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="latest">최신순</option>
          <option value="popular">인기순</option>
          <option value="comments">댓글순</option>
          <option value="views">조회순</option>
        </select>

        <Link href="/community/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            글쓰기
          </Button>
        </Link>
      </div>

      {/* Post List */}
      <PostList boardId={selectedBoardId} sort={sortOption} />
    </main>
  );
}

export default CommunityPage;
