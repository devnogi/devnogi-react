"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Board {
  id: number;
  name: string;
}

interface CategoryProps {
  selectedBoardId: number;
  setSelectedBoardId: (id: number) => void;
}

function Category({ selectedBoardId, setSelectedBoardId }: CategoryProps) {
  const [categories, setCategories] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchBoards() {
      try {
        const response = await fetch("/api/boards");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setCategories(data.data.boards);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchBoards();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const allCategories = [{ id: 0, name: "전체" }, ...categories];

  return (
    <div className="flex gap-2">
      {allCategories.map((category) => (
        <Button
          key={category.id}
          variant={selectedBoardId === category.id ? "default" : "outline"}
          onClick={() => setSelectedBoardId(category.id)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}

export default Category;
