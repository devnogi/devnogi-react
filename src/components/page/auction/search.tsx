import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ItemCategory } from "@/data/item-category";
import React from "react";

export default function AuctionSearch({
  path,
  onCategorySelect,
}: {
  path: ItemCategory[];
  onCategorySelect: (categoryId: string) => void;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-1">
      <Label htmlFor="item-search" className="flex-shrink-0">
        아이템
      </Label>
      <Input
        id="item-search"
        type="text"
        placeholder="아이템 검색"
        className="rounded-xs"
      />
      <Button className="rounded-xs cursor-pointer">찾기</Button>
      <Button className="rounded-xs cursor-pointer">검색 초기화</Button>

      <div className="col-start-2 col-span-full flex items-center space-x-1 text-sm mt-1">
        {path.map((p, index) => (
          <React.Fragment key={p.id}>
            {index > 0 && <span className="mx-1">&gt;</span>}
            <Badge
              className="rounded-xs cursor-pointer hover:bg-primary/80"
              onClick={() => onCategorySelect(p.id)}
            >
              {p.name}
            </Badge>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
