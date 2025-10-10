import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ItemCategory } from "@/data/item-category";
import React from "react";

export default function SearchSection({
  path,
  onCategorySelect,
  itemName,
  setItemName,
}: {
  path: ItemCategory[];
  onCategorySelect: (categoryId: string) => void;
  itemName: string;
  setItemName: (name: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
      {/* Breadcrumb */}
      {path.length > 0 && (
        <div className="flex items-center gap-2 mb-4 text-sm flex-wrap">
          {path.map((p, index) => (
            <React.Fragment key={p.id}>
              {index > 0 && <span className="text-gray-400">›</span>}
              <Badge
                className="rounded-lg cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 font-medium"
                onClick={() => onCategorySelect(p.id)}
              >
                {p.name}
              </Badge>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Label htmlFor="item-search" className="text-sm font-semibold text-gray-700 mb-2 block">
            아이템 검색
          </Label>
          <Input
            id="item-search"
            type="text"
            placeholder="아이템 이름을 입력하세요"
            className="h-12 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        <Button className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all">
          찾기
        </Button>
        <Button
          variant="outline"
          className="h-12 px-6 rounded-xl border-gray-300 hover:bg-gray-50 transition-all"
        >
          초기화
        </Button>
      </div>
    </div>
  );
}
