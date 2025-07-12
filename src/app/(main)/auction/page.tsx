"use client";

import CategoryLayout from "@/components/commons/FilterableListLayout";
import AuctionList from "@/components/page/auction/List";
import { mockItems } from "@/data/mock-data";
import { useState } from "react";

export default function Page() {
  const [category, setCategory] = useState<string>("all");
  const [itemName, setItemName] = useState<string>("");

  return (
    <CategoryLayout
      selectedCategory={category}
      setSelectedCategory={setCategory}
      itemName={itemName}
      setItemName={setItemName}
      categoryStorageKey="lastSelectedCategoryAuction"
    >
      <AuctionList items={mockItems} />
    </CategoryLayout>
  );
}
