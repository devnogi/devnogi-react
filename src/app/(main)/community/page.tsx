"use client";

import { useState } from "react";
import Category from "@/components/page/community/Category";
import List from "@/components/page/community/List";
import PageTitle from "@/components/commons/PageTitle";

function CommunityPage() {
  const [selectedBoardId, setSelectedBoardId] = useState(0);

  return (
    <main className="flex flex-col gap-8">
      <PageTitle title="커뮤니티" />
      <Category
        selectedBoardId={selectedBoardId}
        setSelectedBoardId={setSelectedBoardId}
      />
      <List selectedBoardId={selectedBoardId} />
    </main>
  );
}

export default CommunityPage;
