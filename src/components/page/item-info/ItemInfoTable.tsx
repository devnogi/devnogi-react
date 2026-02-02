"use client";

import { useState } from "react";
import { ItemInfoResponse } from "@/types/item-info";
import { ChevronDown, ChevronUp, Package } from "lucide-react";

interface ItemInfoTableProps {
  items: ItemInfoResponse[];
  isLoading?: boolean;
}

function ItemInfoRow({ item }: { item: ItemInfoResponse }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <tr
        onClick={() => setIsExpanded(!isExpanded)}
        className="hover:bg-[var(--color-ds-neutral-50)] cursor-pointer transition-colors border-b border-[var(--color-ds-neutral-100)]"
      >
        <td className="px-3 md:px-4 py-3">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[var(--color-ds-neutral-100)] flex items-center justify-center flex-shrink-0">
              <Package className="w-3.5 h-3.5 md:w-4 md:h-4 text-[var(--color-ds-secondary)]" />
            </div>
            <span className="font-medium text-[var(--color-ds-text)] text-sm md:text-base truncate">
              {item.name}
            </span>
          </div>
        </td>
        <td className="px-3 md:px-4 py-3 text-xs md:text-sm text-[var(--color-ds-secondary)]">
          {item.topCategory}
        </td>
        <td className="px-3 md:px-4 py-3 text-xs md:text-sm text-[var(--color-ds-secondary)]">
          {item.subCategory}
        </td>
        <td className="hidden md:table-cell px-4 py-3 text-sm text-[var(--color-ds-disabled)] max-w-xs truncate">
          {item.description || "-"}
        </td>
        <td className="px-2 md:px-4 py-3">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[var(--color-ds-disabled)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--color-ds-disabled)]" />
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-[var(--color-ds-neutral-50)]">
          <td colSpan={5} className="px-3 md:px-4 py-3 md:py-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
              {item.inventoryWidth && item.inventoryHeight && (
                <div>
                  <span className="text-[var(--color-ds-disabled)]">인벤토리 크기: </span>
                  <span className="text-[var(--color-ds-text)]">
                    {item.inventoryWidth} x {item.inventoryHeight}
                  </span>
                </div>
              )}
              {item.inventoryMaxBundleCount && (
                <div>
                  <span className="text-[var(--color-ds-disabled)]">최대 번들: </span>
                  <span className="text-[var(--color-ds-text)]">
                    {item.inventoryMaxBundleCount}개
                  </span>
                </div>
              )}
              {item.weaponType && (
                <div>
                  <span className="text-[var(--color-ds-disabled)]">무기 타입: </span>
                  <span className="text-[var(--color-ds-text)]">{item.weaponType}</span>
                </div>
              )}
              {item.maxAlterationCount && (
                <div>
                  <span className="text-[var(--color-ds-disabled)]">최대 개조: </span>
                  <span className="text-[var(--color-ds-text)]">
                    {item.maxAlterationCount}회
                  </span>
                </div>
              )}
              {item.storeSalesPrice && (
                <div>
                  <span className="text-[var(--color-ds-disabled)]">상점 판매가: </span>
                  <span className="text-[var(--color-ds-text)]">
                    {item.storeSalesPrice}
                  </span>
                </div>
              )}
              {item.repair && (
                <div>
                  <span className="text-[var(--color-ds-disabled)]">수리 정보: </span>
                  <span className="text-[var(--color-ds-text)]">{item.repair}</span>
                </div>
              )}
              {item.history && (
                <div className="col-span-full">
                  <span className="text-[var(--color-ds-disabled)]">역사: </span>
                  <span className="text-[var(--color-ds-text)]">{item.history}</span>
                </div>
              )}
              {item.acquisitionMethod && (
                <div className="col-span-full">
                  <span className="text-[var(--color-ds-disabled)]">입수 방법: </span>
                  <span className="text-[var(--color-ds-text)]">
                    {item.acquisitionMethod}
                  </span>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function ItemInfoTable({ items, isLoading }: ItemInfoTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[var(--color-ds-neutral-tone)] overflow-hidden">
        <div className="animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-14 bg-[var(--color-ds-neutral-100)] border-b border-[var(--color-ds-neutral-tone)]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[var(--color-ds-neutral-tone)] p-8 text-center">
        <Package className="w-12 h-12 text-[var(--color-ds-disabled)] mx-auto mb-3" />
        <p className="text-[var(--color-ds-disabled)]">검색 결과가 없습니다.</p>
        <p className="text-sm text-[var(--color-ds-disabled)] mt-1">
          다른 카테고리나 검색어를 시도해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-ds-neutral-tone)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--color-ds-neutral-50)]">
            <tr>
              <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-semibold text-[var(--color-ds-text)]">
                아이템명
              </th>
              <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-semibold text-[var(--color-ds-text)]">
                상위 분류
              </th>
              <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-semibold text-[var(--color-ds-text)]">
                하위 분류
              </th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-semibold text-[var(--color-ds-text)]">
                설명
              </th>
              <th className="px-2 md:px-4 py-3 w-8 md:w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <ItemInfoRow key={`${item.topCategory}-${item.subCategory}-${item.name}`} item={item} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
