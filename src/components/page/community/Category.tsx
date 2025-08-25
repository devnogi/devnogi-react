"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const categories = ["전체", "일반", "정보", "질문"];

function Category() {
  const [selectedCategory, setSelectedCategory] = useState("전체");

  return (
    <div className="flex gap-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          onClick={() => setSelectedCategory(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}

export default Category;
