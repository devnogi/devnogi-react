"use client";

import { useState } from "react";
import Category from "@/components/page/community/Category";
import List from "@/components/page/community/List";
import PageTitle from "@/components/commons/PageTitle";

function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");

  return (
    <main className="flex flex-col gap-8">
      <PageTitle title="커뮤니티" />
      <Category
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <List selectedCategory={selectedCategory} />
    </main>
  );
}

export default CommunityPage;
