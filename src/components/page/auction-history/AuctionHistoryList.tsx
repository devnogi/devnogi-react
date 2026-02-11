"use client";

import { AuctionHistoryItem } from "@/hooks/useAuctionHistory";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ItemOptionPopover from "./ItemOptionPopover";

interface AuctionHistoryListProps {
  items: AuctionHistoryItem[];
  isLoading?: boolean;
}

export default function AuctionHistoryList({
  items,
  isLoading = false,
}: AuctionHistoryListProps) {
  if (isLoading) {
    return (
      <>
        {/* Mobile Skeleton */}
        <div className="md:hidden">
          <div className="bg-white dark:bg-navy-700 rounded-2xl border border-[var(--color-ds-neutral-tone)] overflow-hidden">
            <div className="divide-y divide-[var(--color-ds-neutral-tone)]">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="px-4 py-4 animate-pulse">
                  {/* 1st Line: Enchant skeleton */}
                  <div className="h-3 w-24 bg-gray-200 dark:bg-navy-600 rounded mb-2" />
                  {/* 2nd Line: Item name + price */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-5 w-40 bg-gray-200 dark:bg-navy-600 rounded" />
                    <div className="h-5 w-20 bg-gray-200 dark:bg-navy-600 rounded" />
                  </div>
                  {/* 3rd Line: Tags + date */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <div className="h-4 w-12 bg-gray-100 dark:bg-navy-600 rounded" />
                      <div className="h-4 w-16 bg-gray-100 dark:bg-navy-600 rounded" />
                    </div>
                    <div className="h-4 w-24 bg-gray-100 dark:bg-navy-600 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Skeleton */}
        <div className="hidden md:block bg-white dark:bg-navy-700 rounded-2xl border border-[var(--color-ds-neutral-tone)] overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-[var(--color-ds-card)] to-[var(--color-ds-neutral-50)] border-b-2 border-[var(--color-ds-neutral-tone)]">
            <div className="col-span-5 font-semibold text-[var(--color-ds-ornamental)] text-sm">아이템 이름</div>
            <div className="col-span-2 font-semibold text-[var(--color-ds-ornamental)] text-sm text-center">카테고리</div>
            <div className="col-span-2 font-semibold text-[var(--color-ds-ornamental)] text-sm text-right">가격</div>
            <div className="col-span-2 font-semibold text-[var(--color-ds-ornamental)] text-sm text-center">거래일시</div>
            <div className="col-span-1 font-semibold text-[var(--color-ds-ornamental)] text-sm text-center">수량</div>
          </div>
          {/* Skeleton Rows */}
          <div className="divide-y divide-[var(--color-ds-neutral-100)]">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 px-6 py-4 animate-pulse">
                <div className="col-span-5 flex items-center">
                  <div className="h-4 w-48 bg-gray-200 dark:bg-navy-600 rounded" />
                </div>
                <div className="col-span-2 flex items-center justify-center">
                  <div className="h-6 w-16 bg-gray-100 dark:bg-navy-600 rounded-md" />
                </div>
                <div className="col-span-2 flex items-center justify-end">
                  <div className="h-4 w-20 bg-gray-200 dark:bg-navy-600 rounded" />
                </div>
                <div className="col-span-2 flex items-center justify-center">
                  <div className="h-4 w-24 bg-gray-100 dark:bg-navy-600 rounded" />
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <div className="h-4 w-6 bg-gray-100 dark:bg-navy-600 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-navy-700 rounded-2xl border border-[var(--color-ds-neutral-tone)] py-12">
        <div className="text-center">
          <p className="text-[var(--color-ds-disabled)] text-lg">검색 결과가 없습니다.</p>
          <p className="text-[var(--color-ds-disabled)] text-sm mt-2">
            다른 검색 조건으로 시도해보세요.
          </p>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    if (price === 0) return "0";

    const eok = Math.floor(price / 100000000); // 억
    const man = Math.floor((price % 100000000) / 10000); // 만
    const rest = price % 10000; // 나머지

    const parts: string[] = [];

    if (eok > 0) {
      parts.push(`${eok}억`);
    }

    if (man > 0) {
      parts.push(`${man.toLocaleString("ko-KR")}만`);
    }

    if (rest > 0 || parts.length === 0) {
      parts.push(rest.toLocaleString("ko-KR"));
    }

    return parts.join(" ");
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Extract enchant prefix from display name (축복받은|신성한 + 접두/접미 인챈트)
  const getEnchantPrefix = (displayName: string, itemName: string) => {
    // Remove itemName from displayName to get the enchant prefix
    const prefix = displayName.replace(itemName, "").trim();
    return prefix || null;
  };

  // Extract pure item name without parentheses and their content
  const getItemNameWithoutAttributes = (itemName: string) => {
    return itemName.replace(/\s*\([^)]*\)/g, "").trim();
  };

  // Extract attributes from parentheses in item name
  const getItemAttributes = (itemName: string) => {
    const matches = itemName.match(/\(([^)]+)\)/g);
    if (!matches) return [];
    return matches.map((match) => match.replace(/[()]/g, "").trim());
  };

  return (
    <>
      {/* Mobile List Layout */}
      <div className="md:hidden">
        <div className="bg-white dark:bg-navy-700 rounded-2xl border border-[var(--color-ds-neutral-tone)] overflow-hidden">
          <div className="divide-y divide-[var(--color-ds-neutral-tone)]">
          {items.map((item, index) => (
            <Popover key={`${item.auctionBuyId}-${index}`}>
              <PopoverTrigger asChild>
                <div className="px-4 py-4 hover:bg-[var(--color-ds-primary-50)] transition-colors cursor-pointer">
                  {/* 1st Line: Enchants (축복받은/신성한 + 접두/접미 인챈트) - 항상 공간 유지 */}
                  <div className="text-[10px] text-[var(--color-ds-disabled)] mb-1 min-h-[14px]">
                    {getEnchantPrefix(item.itemDisplayName, item.itemName) || '\u00A0'}
                  </div>

                  {/* 2nd Line: Pure Item Name (Left) + Price (Right) */}
                  <div className="flex justify-between items-center mb-1.5">
                    <h3 className="font-semibold text-[var(--color-ds-text)] text-[0.96rem] flex-1 mr-2">
                      {getItemNameWithoutAttributes(item.itemName)}
                    </h3>
                    <div className="flex items-center flex-shrink-0">
                      <span className="font-bold text-[var(--color-ds-primary)] text-[0.96rem]">
                        {formatPrice(item.auctionPricePerUnit)}
                      </span>
                      <span className="text-sm text-[var(--color-ds-disabled)] ml-1">G</span>
                    </div>
                  </div>

                  {/* 3rd Line: Attribute Tags (Left) + Date (Right) */}
                  <div className="flex justify-between items-center">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {getItemAttributes(item.itemName).length > 0 ? (
                        getItemAttributes(item.itemName).map((attr, idx) => (
                          <span key={idx} className="text-xs text-[var(--color-ds-disabled)]">
                            #{attr}
                          </span>
                        ))
                      ) : (
                        <span></span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.itemCount > 1 && (
                        <span className="text-xs text-[var(--color-ds-disabled)]">
                          ×{item.itemCount}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-[var(--color-ds-disabled)]">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDateShort(item.dateAuctionBuy)}
                      </span>
                    </div>
                  </div>
                </div>
              </PopoverTrigger>

            <PopoverContent
              className="w-[calc(100vw-2rem)] max-w-80 p-3 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-600 rounded-lg shadow-lg max-h-[70vh]"
              side="top"
              align="center"
            >
              <ItemOptionPopover
                itemDisplayName={item.itemDisplayName}
                itemOptions={item.itemOptions}
                price={item.auctionPricePerUnit}
                date={item.dateAuctionBuy}
                dateLabel="거래일시"
              />
            </PopoverContent>
          </Popover>
          ))}
          </div>
        </div>
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block bg-white dark:bg-navy-700 rounded-2xl border border-[var(--color-ds-neutral-tone)] overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-[var(--color-ds-card)] to-[var(--color-ds-neutral-50)] border-b-2 border-[var(--color-ds-neutral-tone)]">
          <div className="col-span-5 font-semibold text-[var(--color-ds-ornamental)] text-sm">
            아이템 이름
          </div>
          <div className="col-span-2 font-semibold text-[var(--color-ds-ornamental)] text-sm text-center">
            카테고리
          </div>
          <div className="col-span-2 font-semibold text-[var(--color-ds-ornamental)] text-sm text-right">
            가격
          </div>
          <div className="col-span-2 font-semibold text-[var(--color-ds-ornamental)] text-sm text-center">
            거래일시
          </div>
          <div className="col-span-1 font-semibold text-[var(--color-ds-ornamental)] text-sm text-center">
            수량
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-[var(--color-ds-neutral-100)]">
          {items.map((item, index) => (
            <Popover key={`${item.auctionBuyId}-${index}`}>
              <PopoverTrigger asChild>
                <div className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[var(--color-ds-primary-50)] transition-colors cursor-pointer">
                  {/* Item Name */}
                  <div className="col-span-5 flex items-center">
                    <div className="truncate">
                      <span className="font-medium text-[var(--color-ds-text)] text-[0.85rem]">
                        {item.itemDisplayName}
                      </span>
                      {item.itemName !== item.itemDisplayName && (
                        <span className="text-xs text-[var(--color-ds-disabled)] ml-2">
                          ({item.itemName})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="col-span-2 flex items-center justify-center gap-1">
                    <Badge
                      variant="secondary"
                      className="rounded-md bg-[var(--color-ds-primary-50)] text-[var(--color-ds-primary)] border-0 text-xs px-2 py-0.5"
                    >
                      {item.itemSubCategory}
                    </Badge>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 flex items-center justify-end">
                    <span className="font-bold text-[var(--color-ds-primary)] text-[0.85rem]">
                      {formatPrice(item.auctionPricePerUnit)}
                    </span>
                    <span className="text-sm text-[var(--color-ds-disabled)] ml-1">G</span>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 flex items-center justify-center text-sm text-[var(--color-ds-disabled)]">
                    {formatDateShort(item.dateAuctionBuy)}
                  </div>

                  {/* Count */}
                  <div className="col-span-1 flex items-center justify-center text-sm text-[var(--color-ds-disabled)]">
                    {item.itemCount}
                  </div>
                </div>
            </PopoverTrigger>

            <PopoverContent
              className="w-80 p-3 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-600 rounded-lg shadow-lg max-h-[70vh]"
              side="right"
              align="start"
            >
              <ItemOptionPopover
                itemDisplayName={item.itemDisplayName}
                itemOptions={item.itemOptions}
                price={item.auctionPricePerUnit}
                date={item.dateAuctionBuy}
                dateLabel="거래일시"
              />
            </PopoverContent>
          </Popover>
        ))}
        </div>
      </div>
    </>
  );
}
